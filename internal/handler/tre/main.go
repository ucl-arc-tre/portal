package tre

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/tre"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/service/users"
	"github.com/ucl-arc-tre/portal/internal/types"
)

type Handler struct {
	users *users.Service
}

func New() *Handler {
	log.Info().Msg("Creating handler")
	return &Handler{users: users.New()}
}

func (h *Handler) GetUserStatus(ctx *gin.Context, params openapi.GetUserStatusParams) {
	user, err := h.users.GetUserByUsername(types.Username(params.Username))
	if err != nil {
		log.Err(err).Any("params", params).Msg("Failed to get user")
		ctx.Status(http.StatusInternalServerError)
		return
	}
	userStatus := openapi.UserStatus{}
	if isApprovedResearcher, err := rbac.HasRole(user, rbac.ApprovedResearcher); err != nil {
		log.Err(err).Any("username", user.Username).Msg("Failed to get role for user")
		ctx.Status(http.StatusInternalServerError)
		return
	} else {
		userStatus.IsApprovedResearcher = isApprovedResearcher
	}
	if expiresAt, err := h.users.NHSDTrainingExpiresAt(user); err != nil {
		log.Err(err).Any("username", user.Username).Msg("Failed to get training expiry for user")
		ctx.Status(http.StatusInternalServerError)
		return
	} else if expiresAt != nil {
		userStatus.NhsdTrainingExpiresAt = ptr(expiresAt.Format(config.TimeFormat))
	}
	ctx.JSON(http.StatusOK, userStatus)
}

func ptr[T any](value T) *T {
	return &value
}
