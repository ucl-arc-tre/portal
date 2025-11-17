package web

import (
	"net/http"

	"github.com/gin-gonic/gin"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/service/environments"
)

func (h *Handler) GetEnvironments(ctx *gin.Context) {
	envs, err := environments.GetAll()
	if err != nil {
		setError(ctx, err, "Failed to fetch environments")
		return
	}

	response := []openapi.Environment{}
	for _, env := range envs {
		response = append(response, openapi.Environment{
			Id:   env.ID.String(),
			Name: string(env.Name),
			Tier: env.Tier,
		})
	}

	ctx.JSON(http.StatusOK, response)
}
