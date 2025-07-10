package tre

import (
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/tre"
	"github.com/ucl-arc-tre/portal/internal/service/users"
)

type Handler struct {
	users *users.Service
}

func New() *Handler {
	log.Info().Msg("Creating handler")
	return &Handler{users: users.New()}
}

func (h *Handler) GetUserStatus(ctx *gin.Context, params openapi.GetUserStatusParams) {

}
