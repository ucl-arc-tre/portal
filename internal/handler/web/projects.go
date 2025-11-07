package web

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/types"
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

	// Validate that user has owner role on the study
	studyUUID, err := uuid.Parse(req.StudyId)
	if err != nil {
		setError(ctx, types.NewErrInvalidObject(err), "Invalid study ID")
		return
	}

	user := middleware.GetUser(ctx)
	requiredStudyRole := rbac.StudyRole{StudyID: studyUUID, Name: rbac.StudyOwner}
	if hasRole, err := rbac.HasRole(user, requiredStudyRole.RoleName()); err != nil {
		setError(ctx, err, "Failed to check study access")
		return
	} else if !hasRole {
		ctx.Status(http.StatusForbidden)
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
