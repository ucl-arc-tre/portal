package web

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
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

func parseUUIDOrSetError(ctx *gin.Context, id string) (uuid.UUID, error) {
	uuid, err := uuid.Parse(id)
	if err != nil {
		setError(ctx, types.NewErrInvalidObject(err), "Invalid id. Expeced uuid")
		return [16]byte{}, err
	}
	return uuid, nil
}

func parseUUIDsOrSetError(ctx *gin.Context, ids ...string) ([]uuid.UUID, error) {
	uuids := []uuid.UUID{}
	for _, id := range ids {
		uuid, err := uuid.Parse(id)
		if err != nil {
			setError(ctx, types.NewErrInvalidObject(err), "Invalid id. Expeced uuid")
			return uuids, err
		}
		uuids = append(uuids, uuid)
	}
	return uuids, nil
}
