package tre

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/tre"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func setError(ctx *gin.Context, err error) {
	if err == nil {
		panic(fmt.Errorf("set error called with nil error"))
	}

	if v, ok := errors.AsType[*types.ErrClientInvalidObject](err); ok && v != nil {
		ctx.JSON(http.StatusNotAcceptable, openapi.Error{
			Message: v.ClientReadableReason,
		})
		return
	} else if errors.Is(err, types.ErrInvalidObject) {
		log.Err(err).Msg("Invalid object")
		ctx.JSON(http.StatusNotAcceptable, openapi.Error{Message: "Invalid object"})
		return
	}

	statusCode := http.StatusInternalServerError
	if errors.Is(err, types.ErrNotFound) {
		statusCode = http.StatusNotFound
	} else {
		err = fmt.Errorf("unknown error: %v", err)
	}
	log.Err(err).Msg("response error")
	ctx.Status(statusCode)
}
