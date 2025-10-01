package auth

import (
	"context"

	"github.com/rs/zerolog/log"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/types"
)

type Service struct {
}

func New() *Service {
	return &Service{}
}

func (s *Service) AuthInfo(ctx context.Context, user types.User) (*openapi.Auth, error) {
	roles, err := rbac.Roles(user)
	if err != nil {
		log.Err(err).Any("user", user.Username).Msg("Failed to get user roles")
		return nil, err
	}

	info := &openapi.Auth{
		Username: string(user.Username),
	}
	for _, role := range roles {
		info.Roles = append(info.Roles, openapi.AuthRoles(role))
	}

	log.Debug().
		Any("user", user.Username).
		Any("info", info).
		Msg("Retrieved auth info for user")
	return info, nil
}
