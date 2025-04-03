package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
)

type Handler struct{}

func New() *Handler {
	log.Info().Msg("Creating handler")
	return &Handler{}
}

func (h *Handler) GetHello(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, openapi.HelloResponse{
		Message: "world",
	})
}
