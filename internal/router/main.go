package router

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/middleware"
)

// Create a new gin Router with middleware and a /ping route attached
func New() *gin.Engine {
	log.Info().Msg("Creating router")
	router := gin.Default()
	router.Group("/ping").GET("", ping)
	router.Use(middleware.NewSecure(), middleware.LimitBodySize)
	return router
}

func ping(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, gin.H{"message": "pong"})
}
