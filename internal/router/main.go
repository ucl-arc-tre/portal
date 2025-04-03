package router

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

func New() *gin.Engine {
	log.Info().Msg("Creating router")
	router := gin.Default()
	router.Group("/ping").GET("", ping)
	return router
}

func ping(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, gin.H{"message": "pong"})
}
