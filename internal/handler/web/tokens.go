package web

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/service/environments"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func (h *Handler) GetTokensEnvironment(ctx *gin.Context, environmentParam openapi.GetTokensEnvironmentParamsEnvironment) {
	environmentName := types.EnvironmentName("")
	switch environmentParam {
	case openapi.GetTokensEnvironmentParamsEnvironmentTre:
		environmentName = environments.TRE
	case openapi.GetTokensEnvironmentParamsEnvironmentDsh:
		environmentName = environments.DSH
	}

	dshId, err := h.environments.EnvironmentId(environmentName)
	if err != nil {
		setError(ctx, err, "Failed to get environment")
		return
	}
	tokens, err := h.tokens.AllEnvironment(dshId)
	if err != nil {
		setError(ctx, err, "Failed to get DSH API tokens")
		return
	}
	response := []openapi.Token{}
	for _, token := range tokens {
		response = append(response, openapi.Token{
			Id:        token.ID.String(),
			Name:      token.Name,
			ExpiresAt: openapi.FormatTime(token.ExpiresAt),
		})
	}
	ctx.JSON(http.StatusOK, response)
}

func (h *Handler) PostTokensEnvironment(
	ctx *gin.Context,
	environmentParam openapi.PostTokensEnvironmentParamsEnvironment,
) {
	user := middleware.GetUser(ctx)

	request := openapi.TokenRequest{}
	if err := bindJSONOrSetError(ctx, &request); err != nil {
		return
	}

	environmentName := types.EnvironmentName("")
	scopes := []string{}
	switch environmentParam {
	case openapi.PostTokensEnvironmentParamsEnvironmentTre:
		environmentName = environments.TRE
		scopes = []string{"tre:r", "tre:w"} // defined by the OpenAPI schema
	case openapi.PostTokensEnvironmentParamsEnvironmentDsh:
		environmentName = environments.DSH
		scopes = []string{"dsh:r", "dsh:w"} // defined by the OpenAPI schema
	}
	dshId, err := h.environments.EnvironmentId(environmentName)
	if err != nil {
		setError(ctx, err, "Failed to get environment")
		return
	}
	token := types.Token{
		ModelAuditable: types.ModelAuditable{Model: types.Model{ID: uuid.New()}},
		Name:           request.Name,
		ExpiresAt:      time.Now().Add(time.Duration(request.ValidForDays) * 24 * time.Hour),
		CreatorUserID:  user.ID,
		EnvironmentID:  dshId,
	}
	tokenWithValue, err := h.tokens.Create(token, scopes)
	if err != nil {
		setError(ctx, err, "Failed to get DSH API tokens")
		return
	}
	ctx.JSON(http.StatusOK, openapi.TokenWithValue{
		Id:        token.ID.String(),
		Value:     tokenWithValue.Value,
		Name:      token.Name,
		ExpiresAt: openapi.FormatTime(token.ExpiresAt),
	})
}

func (h *Handler) DeleteTokensEnvironmentTokenId(
	ctx *gin.Context,
	environmentParam openapi.DeleteTokensEnvironmentTokenIdParamsEnvironment,
	tokenId string,
) {
	environmentName := types.EnvironmentName("")
	switch environmentParam {
	case openapi.DeleteTokensEnvironmentTokenIdParamsEnvironmentTre:
		environmentName = environments.TRE
	case openapi.DeleteTokensEnvironmentTokenIdParamsEnvironmentDsh:
		environmentName = environments.DSH
	}

	tokenUUID, err := parseUUIDOrSetError(ctx, tokenId)
	if err != nil {
		return
	}
	dshId, err := h.environments.EnvironmentId(environmentName)
	if err != nil {
		setError(ctx, err, "Failed to get environment")
		return
	}
	if err := h.tokens.Delete(tokenUUID, dshId); err != nil {
		setError(ctx, err, "Failed to delete token")
		return
	}
	ctx.Status(http.StatusNoContent)
}
