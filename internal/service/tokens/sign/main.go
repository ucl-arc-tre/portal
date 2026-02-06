package sign

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	"github.com/ucl-arc-tre/portal/internal/service/environments"
	"github.com/ucl-arc-tre/portal/internal/service/tokens"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

type Service struct {
	key Ed25519KeyPair
	db  *gorm.DB
}

func New() *Service {
	service := Service{
		db:  graceful.NewDB(),
		key: mustMakeEd25519KeyPair(),
	}
	service.mustStoreVerificationKey()
	return &service
}

func (s *Service) mustStoreVerificationKey() {
	key := types.TokenVerificationKey{
		ModelAuditable: types.ModelAuditable{Model: types.Model{ID: s.key.Id()}},
		Kind:           s.key.Kind(),
		ValueBase64:    s.key.PublicBase64(),
	}
	if err := s.db.Create(&key).Error; err != nil {
		panic(fmt.Errorf("failed to store validation key: %w", err))
	}
}

func (s *Service) AllDSH() ([]types.Token, error) {
	tokens := []types.Token{}
	result := s.db.Model(&types.Token{}).
		Joins("left join environments on tokens.environment_id = environments.id").
		Where("environments.name = ?", environments.DSH).
		Find(&tokens)
	if result.Error != nil {
		return tokens, types.NewErrFromGorm(result.Error, "failed to get dsh tokens")
	}
	return tokens, nil
}

// CreateDSH a DSH API token with the default scopes
func (s *Service) CreateDSH(token types.Token) (*TokenWithValue, error) {
	if token.ExpiresAt.After(time.Now().Add(config.MaxTokenValidity)) {
		return nil, types.NewErrInvalidObject(fmt.Errorf("token had a expiry [%s] beyond the max", token.ExpiresAt))
	}

	token.VerificationKeyID = s.key.Id()
	claims := tokens.Claims{
		Scopes: []string{"r", "w"},
		RegisteredClaims: jwt.RegisteredClaims{
			ID:        token.ID.String(),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(token.ExpiresAt),
			Issuer:    config.JWTIssuer(),
			Subject:   string(environments.DSH),
		},
	}
	jwtToken := jwt.NewWithClaims(jwt.SigningMethodEdDSA, claims)
	value, err := jwtToken.SignedString(s.key.Private())
	if err != nil {
		return nil, types.NewErrServerError(err)
	}
	if err := s.db.Create(&token).Error; err != nil {
		return nil, types.NewErrFromGorm(err)
	}
	return &TokenWithValue{Value: value, Token: token}, nil
}

func (s *Service) Delete(tokenId uuid.UUID, environmentId uuid.UUID) error {
	err := s.db.Delete(&types.Token{}, "id = ? AND environment_id = ?", tokenId, environmentId).Error
	if err != nil {
		return types.NewErrFromGorm(err)
	}
	return nil
}
