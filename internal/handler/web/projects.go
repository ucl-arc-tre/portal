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
	projectTreData := openapi.ProjectTRERequest{}
	if err := bindJSONOrSetError(ctx, &projectTreData); err != nil {
		return
	}

	studyUUID, err := uuid.Parse(projectTreData.StudyId)
	if err != nil {
		setError(ctx, types.NewErrInvalidObject(err), "Invalid study ID")
		return
	}

	user := middleware.GetUser(ctx)
	// Validate that user has owner role on the study
	studyOwnerRole := rbac.StudyRole{StudyID: studyUUID, Name: rbac.StudyOwner}
	if isStudyOwner, err := rbac.HasRole(user, studyOwnerRole.RoleName()); err != nil {
		setError(ctx, err, "Failed to check study access")
		return
	} else if !isStudyOwner {
		ctx.Status(http.StatusForbidden)
		return
	}

	// TODO: Allow additional study admins to create projects (need to add StudyAdmin RBAC role)

	isUpdate := false
	validationError, err := h.projects.ValidateProjectTREData(ctx, projectTreData, studyUUID, user, isUpdate)
	if err != nil {
		setError(ctx, err, "Failed to validate project")
		return
	} else if validationError != nil {
		ctx.JSON(http.StatusBadRequest, *validationError)
		return
	}

	if err := h.projects.CreateProjectTRE(ctx, user, studyUUID, projectTreData); err != nil {
		setError(ctx, err, "Failed to create project")
		return
	}

	ctx.Status(http.StatusCreated)
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
