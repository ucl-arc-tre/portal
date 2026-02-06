package web

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/service/environments"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func (h *Handler) GetTokensDsh(ctx *gin.Context) {
	tokens, err := h.tokens.AllDSH()
	if err != nil {
		setError(ctx, err, "Failed to get DSH API tokens")
		return
	}
	response := []openapi.Token{}
	for _, token := range tokens {
		response = append(response, openapi.Token{
			Id:        token.ID.String(),
			Name:      token.Name,
			ExpiresAt: token.ExpiresAt.Format(config.TimeFormat),
		})
	}
	ctx.JSON(http.StatusOK, response)
}

func (h *Handler) PostTokensDsh(ctx *gin.Context) {
	user := middleware.GetUser(ctx)

	request := openapi.TokenRequest{}
	if err := bindJSONOrSetError(ctx, &request); err != nil {
		return
	}
	dshId, err := h.environments.EnvironmentId(environments.DSH)
	if err != nil {
		setError(ctx, err, "Failed to get envrionment")
		return
	}
	token := types.Token{
		ModelAuditable: types.ModelAuditable{Model: types.Model{ID: uuid.New()}},
		Name:           request.Name,
		ExpiresAt:      time.Now().Add(time.Duration(request.ValidForDays) * 24 * time.Hour),
		CreatorUserID:  user.ID,
		EnvironmentID:  dshId,
	}
	tokenWithValue, err := h.tokens.CreateDSH(token)
	if err != nil {
		setError(ctx, err, "Failed to get DSH API tokens")
		return
	}
	ctx.JSON(http.StatusOK, openapi.TokenWithValue{
		Id:        token.ID.String(),
		Value:     tokenWithValue.Value,
		Name:      token.Name,
		ExpiresAt: token.ExpiresAt.Format(config.TimeFormat),
	})
}

func (h *Handler) DeleteTokensDshTokenId(ctx *gin.Context, tokenId string) {
	tokenUUID, err := parseUUIDOrSetError(ctx, tokenId)
	if err != nil {
		return
	}
	dshId, err := h.environments.EnvironmentId(environments.DSH)
	if err != nil {
		setError(ctx, err, "Failed to get envrionment")
		return
	}
	if err := h.tokens.Delete(tokenUUID, dshId); err != nil {
		setError(ctx, err, "Failed to delete token")
		return
	}
	ctx.Status(http.StatusNoContent)
}
