package web

import (
	"net/http"

	"github.com/gin-gonic/gin"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
)

func (h *Handler) GetProjectsTre(ctx *gin.Context) {
	// TODO: Implement project fetching logic

	ctx.JSON(http.StatusOK, []openapi.ProjectTRE{})
}

func (h *Handler) PostProjectsTre(ctx *gin.Context) {
	req := openapi.ProjectTRERequest{}
	if err := bindJSONOrSetError(ctx, &req); err != nil {
		return
	}

	// TODO: Implement project creation logic

	ctx.Status(http.StatusNotImplemented)
}

func (h *Handler) GetProjectsTreProjectId(ctx *gin.Context, projectId string) {
	projectUUID, err := parseUUIDOrSetError(ctx, projectId)
	if err != nil {
		return
	}

	// TODO: Implement project fetching logic

	_ = projectUUID // avoid unused variable error for now
	ctx.Status(http.StatusNotImplemented)
}
