package tre

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func setError(ctx *gin.Context, err error) {
	if err == nil {
		panic(fmt.Errorf("set error called with nil error"))
	}

	statusCode := http.StatusInternalServerError
	if errors.Is(err, types.ErrInvalidObject) {
		statusCode = http.StatusNotAcceptable
	} else if errors.Is(err, types.ErrNotFound) {
		statusCode = http.StatusNotFound
	} else {
		err = fmt.Errorf("unknown error: %v", err)
	}
	log.Err(err).Msg("response error")
	ctx.Status(statusCode)
}
