package auth

import (
	"context"

	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/controller/entra"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/types"
)

type Service struct {
	entra *entra.Controller
}

func New() *Service {
	service := Service{
		entra: entra.New(),
	}
	return &service
}

func (s *Service) AuthInfo(ctx context.Context, user types.User) (*types.AuthInfo, error) {
	roles, err := rbac.Roles(user)
	if err != nil {
		log.Error().Err(err).Any("user", user.Username).Msg("Failed to get user roles")
		return nil, types.NewErrServerError(err)
	}

	isStaff, err := s.entra.IsStaffMember(ctx, user.Username)
	if err != nil {
		log.Warn().Err(err).Any("user", user.Username).Msg("Failed to validate employee status")
		isStaff = false // Default to false if there's an error
	}

	authInfo := &types.AuthInfo{
		Roles:   roles,
		IsStaff: isStaff,
	}

	log.Debug().
		Any("user", user.Username).
		Strs("roles", authInfo.Roles).
		Bool("isStaff", authInfo.IsStaff).
		Msg("Retrieved auth info for user")

	return authInfo, nil
}
