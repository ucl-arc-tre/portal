package tokens

import (
	"crypto/ed25519"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/hashicorp/golang-lru/v2/expirable"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

const (
	cacheTTL      = 60 * time.Second
	cacheElements = 10000
)

type Service struct {
	key                  Ed25519KeyPair
	db                   *gorm.DB
	verificationKeyCache *expirable.LRU[TokenId, ed25519.PublicKey]
	isDeletedCache       *expirable.LRU[TokenId, bool]
}

func New() *Service {
	service := Service{
		db:                   graceful.NewDB(),
		verificationKeyCache: newTokenLRU[ed25519.PublicKey](),
		isDeletedCache:       newTokenLRU[bool](),
		key:                  mustMakeEd25519KeyPair(),
	}
	service.storeValidationKey()
	return &service
}

func (s *Service) storeValidationKey() {
	key := types.VerificationKey{
		ModelAuditable: types.ModelAuditable{Model: types.Model{ID: s.key.id}},
		Kind:           s.key.Kind(),
		Value:          s.key.publicKey,
	}
	if err := s.db.Create(&key).Error; err != nil {
		panic(fmt.Errorf("failed to store validation key: %w", err))
	}
}

// Verify a JWT token contained in the Authorization header
func (s *Service) ParseClaims(rawToken string) (*Claims, error) {
	claims := Claims{}
	_, err := jwt.ParseWithClaims(rawToken, &claims, s.verificationKeyForToken)
	if err != nil {
		return nil, err
	}
	return &claims, nil
}

func (s *Service) verificationKeyForToken(token *jwt.Token) (any, error) {
	if _, ok := token.Method.(*jwt.SigningMethodEd25519); !ok {
		return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
	}
	if claims, ok := token.Claims.(*Claims); ok {
		id, err := parseTokenId(claims.ID)
		if err != nil {
			return nil, err
		}
		if isDeleted, err := s.isDeleted(id); err != nil {
			return nil, err
		} else if isDeleted {
			return nil, fmt.Errorf("token has been deleted: %v", claims.ID)
		}
		return s.verificationKey(id)
	} else {
		return nil, fmt.Errorf("failed to parse claims: %v", token.Header)
	}
}

func (s *Service) isDeleted(id TokenId) (bool, error) {
	if value, existsInCache := s.isDeletedCache.Get(id); existsInCache {
		return value, nil
	}
	var exists bool
	result := s.db.Model(&types.Token{}).Select("count(*) > 0").Where("id = ?", id).Find(&exists)
	if result.Error != nil {
		return true, result.Error
	}
	_ = s.isDeletedCache.Add(id, exists)
	return exists, nil
}

func (s *Service) verificationKey(id TokenId) (ed25519.PublicKey, error) {
	if value, existsInCache := s.verificationKeyCache.Get(id); existsInCache {
		return value, nil
	}
	var value ed25519.PublicKey
	result := s.db.Model(&types.VerificationKey{}).
		Select("verification_key.value").
		Joins("left join tokens on tokens.verification_key_id = verification_key.id").
		Where("verification_key.kind = ? AND tokens.id = ?", s.key.Kind(), id).
		Scan(&value)
	if result.Error != nil {
		return ed25519.PublicKey(""), result.Error
	}
	_ = s.verificationKeyCache.Add(id, value)
	return value, nil
}

func parseTokenId(s string) (TokenId, error) {
	id, err := uuid.Parse(s)
	return TokenId(id), err
}

func newTokenLRU[T any]() *expirable.LRU[TokenId, T] {
	return expirable.NewLRU[TokenId, T](cacheElements, nil, cacheTTL)
}
