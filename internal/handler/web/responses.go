package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/middleware"
)

func setInvalid(ctx *gin.Context, err error, message string) {
	setErrResponse(ctx, err, http.StatusNotAcceptable, message)
}

func setServerError(ctx *gin.Context, err error, message string) {
	setErrResponse(ctx, err, http.StatusInternalServerError, message)
}

func setErrResponse(ctx *gin.Context, err error, status int, message string) {
	user := middleware.GetUser(ctx)
	if err != nil {
		log.Err(err).Any("username", user.Username).Msg(message)
		ctx.Status(status)
	}
}
