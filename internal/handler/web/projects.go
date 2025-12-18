package web

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func (h *Handler) GetProjects(ctx *gin.Context) {
	user := middleware.GetUser(ctx)

	var projects []types.Project
	var err error

	isAdmin, err := rbac.HasRole(user, rbac.Admin)
	if err != nil {
		setError(ctx, err, "Failed to check user roles")
		return
	}

	isTreOpsStaff, err := rbac.HasRole(user, rbac.TreOpsStaff)
	if err != nil {
		setError(ctx, err, "Failed to check user roles")
		return
	}

	if isAdmin || isTreOpsStaff {
		// Admin & TRE ops staff: fetch ALL projects
		projects, err = h.projectsAdmin()
	} else {
		// Regular user: fetch only projects they own (via RBAC)
		projects, err = h.projectsProjectOwner(user)
	}

	if err != nil {
		setError(ctx, err, "Failed to get projects")
		return
	}

	// Convert to OpenAPI format
	response := []openapi.Project{}
	for _, project := range projects {
		response = append(response, openapi.Project{
			Id:              project.ID.String(),
			Name:            project.Name,
			StudyId:         project.StudyID.String(),
			CreatorUsername: string(project.CreatorUser.Username),
			ApprovalStatus:  openapi.ApprovalStatus(project.ApprovalStatus),
			CreatedAt:       project.CreatedAt.Format(config.TimeFormat),
			UpdatedAt:       project.UpdatedAt.Format(config.TimeFormat),
			EnvironmentName: string(project.Environment.Name),
		})
	}

	ctx.JSON(http.StatusOK, response)
}

func (h *Handler) projectsAdmin() ([]types.Project, error) {
	return h.projects.AllProjects()
}

func (h *Handler) projectsProjectOwner(user types.User) ([]types.Project, error) {
	// Get project IDs where user has owner role (includes inherited via study ownership)
	projectIds, err := rbac.ProjectIDsWithRole(user, rbac.ProjectOwner)
	if err != nil {
		return []types.Project{}, err
	}

	projects, err := h.projects.ProjectsById(projectIds...)
	if err != nil {
		return []types.Project{}, err
	}

	return projects, nil
}

func (h *Handler) GetProjectsTre(ctx *gin.Context) {
	// todo: implement fetching tre projects

	ctx.Status(http.StatusNotImplemented)
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

	validationError, err := h.projects.ValidateProjectTREData(ctx, projectTreData, studyUUID)
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

	projectTRE, err := h.projects.ProjectTreById(projectUUID)
	if err != nil {
		setError(ctx, err, "Failed to get tre project")
		return
	}

	if projectTRE == nil {
		ctx.Status(http.StatusNotFound)
		return
	}

	// Extract assets from ProjectAssets relationship
	assets := []openapi.Asset{}
	for _, projectAsset := range projectTRE.Project.ProjectAssets {
		assets = append(assets, assetToOpenApiAsset(projectAsset.Asset))
	}

	// Extract members from TRE role bindings
	members := extractProjectMembers(projectTRE)

	response := openapi.ProjectTRE{
		Id:              projectTRE.Project.ID.String(),
		Name:            projectTRE.Project.Name,
		StudyId:         projectTRE.Project.StudyID.String(),
		StudyTitle:      projectTRE.Project.Study.Title,
		CreatorUsername: string(projectTRE.Project.CreatorUser.Username),
		ApprovalStatus:  openapi.ApprovalStatus(projectTRE.Project.ApprovalStatus),
		CreatedAt:       projectTRE.Project.CreatedAt.Format(config.TimeFormat),
		UpdatedAt:       projectTRE.Project.UpdatedAt.Format(config.TimeFormat),
		EnvironmentName: string(projectTRE.Project.Environment.Name),
		Assets:          assets,
		Members:         members,
	}

	ctx.JSON(http.StatusOK, response)
}

func (h *Handler) PutProjectsTreProjectId(ctx *gin.Context, projectId string) {
	projectUUID, err := parseUUIDOrSetError(ctx, projectId)
	if err != nil {
		return
	}

	projectUpdateData := openapi.ProjectTREUpdate{}
	if err := bindJSONOrSetError(ctx, &projectUpdateData); err != nil {
		return
	}

	// Get the existing project to validate study ownership
	projectTRE, err := h.projects.ProjectTreById(projectUUID)
	if err != nil {
		setError(ctx, err, "Failed to get project")
		return
	}

	if projectTRE == nil {
		ctx.Status(http.StatusNotFound)
		return
	}

	studyUUID := projectTRE.Project.StudyID

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

	validationError, err := h.projects.ValidateProjectTREUpdate(ctx, projectUpdateData, studyUUID)
	if err != nil {
		setError(ctx, err, "Failed to validate project update")
		return
	} else if validationError != nil {
		ctx.JSON(http.StatusBadRequest, *validationError)
		return
	}

	if err := h.projects.UpdateProjectTRE(ctx, projectUUID, projectUpdateData); err != nil {
		setError(ctx, err, "Failed to update project")
		return
	}

	ctx.Status(http.StatusOK)
}

func extractProjectMembers(projectTRE *types.ProjectTRE) []openapi.ProjectTREMember {
	rolesMap := map[types.Username][]openapi.ProjectTRERoleName{}

	for _, binding := range projectTRE.TRERoleBindings {
		rolesMap[binding.User.Username] = append(rolesMap[binding.User.Username], openapi.ProjectTRERoleName(binding.Role))
	}

	members := []openapi.ProjectTREMember{}
	for username, roles := range rolesMap {
		members = append(members, openapi.ProjectTREMember{
			Username: string(username),
			Roles:    roles,
		})
	}

	return members
}

func (h *Handler) PatchProjectsTreProjectIdPending(ctx *gin.Context, projectId string) {
	projectUUID, err := parseUUIDOrSetError(ctx, projectId)
	if err != nil {
		return
	}

	err = h.projects.SubmitProject(projectUUID)
	if err != nil {
		setError(ctx, err, "Failed to submit project")
		return
	}

	ctx.Status(http.StatusOK)
}

func (h *Handler) PostProjectsTreAdminProjectIdApprove(ctx *gin.Context, projectId string) {
	projectUUID, err := parseUUIDOrSetError(ctx, projectId)
	if err != nil {
		return
	}

	// TODO: check that the project status is "Pending", otherwise return a 400??

	err = h.projects.ApproveProject(projectUUID)
	if err != nil {
		setError(ctx, err, "Failed to approve project")
		return
	}

	ctx.Status(http.StatusOK)
}
