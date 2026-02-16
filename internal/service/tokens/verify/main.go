package verify

import (
	"crypto/ed25519"
	"encoding/base64"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/hashicorp/golang-lru/v2/expirable"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	"github.com/ucl-arc-tre/portal/internal/service/tokens"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

const (
	cacheTTL      = 10 * time.Second
	cacheElements = 10000
)

type Service struct {
	parser               *jwt.Parser
	db                   *gorm.DB
	verificationKeyCache *expirable.LRU[tokens.TokenId, ed25519.PublicKey]
	isRevokedCache       *expirable.LRU[tokens.TokenId, bool]
}

func New() *Service {
	service := Service{
		parser:               jwt.NewParser(jwt.WithIssuer(config.JWTIssuer())),
		db:                   graceful.NewDB(),
		verificationKeyCache: newTokenLRU[ed25519.PublicKey](),
		isRevokedCache:       newTokenLRU[bool](),
	}
	return &service
}

// Verify a JWT token contained in the Authorization header and
// parse the claims within
func (s *Service) ParseClaims(rawToken string) (*tokens.Claims, error) {
	claims := tokens.Claims{}
	_, err := s.parser.ParseWithClaims(rawToken, &claims, s.verificationKeyForToken)
	if err != nil {
		return nil, err
	}
	return &claims, nil
}

func (s *Service) verificationKeyForToken(token *jwt.Token) (any, error) {
	if _, ok := token.Method.(*jwt.SigningMethodEd25519); !ok {
		return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
	}
	claims, ok := token.Claims.(*tokens.Claims)
	if !ok {
		return nil, fmt.Errorf("failed to parse claims: %v", token.Header)
	}
	id, err := parseTokenId(claims.ID)
	if err != nil {
		return nil, err
	}
	if isRevoked, err := s.isRevoked(id); err != nil {
		return nil, err
	} else if isRevoked {
		return nil, fmt.Errorf("token has been deleted: %v", claims.ID)
	}
	return s.verificationKey(id)
}

func (s *Service) isRevoked(id tokens.TokenId) (bool, error) {
	if value, existsInCache := s.isRevokedCache.Get(id); existsInCache {
		return value, nil
	}
	var exists bool
	result := s.db.Model(&types.Token{}).Select("count(*) > 0").Where("id = ?", id).Find(&exists)
	if result.Error != nil {
		return true, result.Error
	}
	_ = s.isRevokedCache.Add(id, !exists)
	return !exists, nil
}

func (s *Service) verificationKey(id tokens.TokenId) (ed25519.PublicKey, error) {
	if value, existsInCache := s.verificationKeyCache.Get(id); existsInCache {
		return value, nil
	}
	var valueBase64 string
	result := s.db.Model(&types.TokenVerificationKey{}).
		Select("token_verification_keys.value_base64").
		Joins("left join tokens on tokens.verification_key_id = token_verification_keys.id").
		Where("token_verification_keys.kind = ? AND tokens.id = ?", types.VerificationKeyKindEd25519, id).
		Scan(&valueBase64)
	if result.Error != nil {
		return ed25519.PublicKey(""), result.Error
	}
	keyBytes, err := base64.StdEncoding.DecodeString(valueBase64)
	if err != nil {
		return ed25519.PublicKey(""), err
	}
	publicKey := ed25519.PublicKey(keyBytes)
	_ = s.verificationKeyCache.Add(id, publicKey)
	return publicKey, nil
}

func parseTokenId(s string) (tokens.TokenId, error) {
	id, err := uuid.Parse(s)
	return id, err
}

func newTokenLRU[T any]() *expirable.LRU[tokens.TokenId, T] {
	return expirable.NewLRU[tokens.TokenId, T](cacheElements, nil, cacheTTL)
}
