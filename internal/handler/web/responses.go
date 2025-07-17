package web

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func setError(ctx *gin.Context, err error, message string) {
	if err == nil {
		panic(fmt.Errorf("set error called with nil error [%v]", message))
	}
	if errors.Is(err, types.ErrServerError) {
		setErrResponse(ctx, err, http.StatusInternalServerError, message)
		return
	} else if errors.Is(err, types.ErrInvalidObject) {
		setErrResponse(ctx, err, http.StatusNotAcceptable, message)
		return
	}
	setErrResponse(ctx, fmt.Errorf("unknown error: %v", err), 520, message)
}

func setErrResponse(ctx *gin.Context, err error, status int, message string) {
	user := middleware.GetUser(ctx)
	if err != nil {
		log.Err(err).Any("username", user.Username).Msg(message)
		ctx.Status(status)
	}
}

func bindJSONOrSetError(ctx *gin.Context, obj any) error {
	err := ctx.ShouldBindJSON(&obj)
	if err != nil {
		setError(ctx, types.NewErrInvalidObject(err), "Invalid JSON object")
	}
	return err
}
