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
	statusCode := 520
	if errors.Is(err, types.ErrServerError) {
		statusCode = http.StatusInternalServerError
	} else if errors.Is(err, types.ErrInvalidObject) {
		statusCode = http.StatusNotAcceptable
	} else if errors.Is(err, types.ErrNotFound) {
		statusCode = http.StatusNotFound
	} else {
		err = fmt.Errorf("unknown error: %v", err)
	}
	user := middleware.GetUser(ctx)
	log.Err(err).Any("username", user.Username).Msg(message)
	ctx.Status(statusCode)
}

func bindJSONOrSetError(ctx *gin.Context, obj any) error {
	err := ctx.ShouldBindJSON(&obj)
	if err != nil {
		setError(ctx, types.NewErrInvalidObject(err), "Invalid JSON object")
	}
	return err
}
