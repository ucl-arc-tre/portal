package auth

import (
	"context"
	"time"

	"github.com/gin-gonic/gin"
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
		entra: entra.New(1 * time.Hour),
	}
	return &service
}

func (s *Service) GetAuthInfo(ctx *gin.Context, user types.User) ([]string, bool, error) {
	roles, err := rbac.GetRoles(user)
	if err != nil {
		log.Error().Err(err).Str("user", string(user.Username)).Msg("Failed to get user roles")
		return nil, false, types.NewErrServerError(err)
	}

	isUclStaff, err := s.entra.ValidateEmployeeStatus(context.Background(), string(user.Username))
	if err != nil {
		log.Warn().Err(err).Str("user", string(user.Username)).Msg("Failed to validate employee status")
		isUclStaff = false // Default to false if there's an error
	}

	log.Debug().
		Str("user", string(user.Username)).
		Strs("roles", roles).
		Bool("isUclStaff", isUclStaff).
		Msg("Retrieved auth info for user")

	return roles, isUclStaff, nil
}
