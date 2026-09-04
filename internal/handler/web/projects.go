package web

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/service/environments"
	"github.com/ucl-arc-tre/portal/internal/service/projects"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func (h *Handler) projectsAll(params openapi.GetProjectsParams, envs ...types.EnvironmentName) ([]projects.GenericProject, error) {
	if !params.Valid() {
		return []projects.GenericProject{}, types.NewErrClientInvalidObject("invalid query param")
	}
	if params.Limit != nil && *params.Limit > config.DefaultPageSize {
		return []projects.GenericProject{}, types.NewErrClientInvalidObjectF("maxItems cannot be greater than %d", config.DefaultPageSize)
	}
	if params.Limit != nil && *params.Limit <= 0 {
		return []projects.GenericProject{}, types.NewErrClientInvalidObject("maxItems must be greater than 0")
	}
	if params.Offset != nil && *params.Offset < 0 {
		return []projects.GenericProject{}, types.NewErrClientInvalidObject("startIndex cannot be negative")
	}

	queryParams := projects.QueryParams{
		Owner:  params.Owner,
		Limit:  config.DefaultPageSize,
		Offset: 0,
	}
	if params.QueryIsOwnerUsername() {
		queryParams.Owner = params.Query
	} else if params.Query != nil {
		queryParams.FuzzyName = params.Query
	}
	if params.Limit != nil {
		queryParams.Limit = *params.Limit
	}
	if params.Offset != nil {
		queryParams.Offset = *params.Offset
	}
	return h.projects.AllProjects(queryParams, envs...)
}

func (h *Handler) GetProjects(ctx *gin.Context, params openapi.GetProjectsParams) {
	user := middleware.GetUser(ctx)

	var projects []projects.GenericProject
	var err error

	isDshOpsStaff, err := rbac.HasRole(user, rbac.DSHOpsStaff)
	if err != nil {
		setError(ctx, err, "Failed to check user roles")
		return
	}

	isTreOpsStaff, err := rbac.HasRole(user, rbac.TreOpsStaff)
	if err != nil {
		setError(ctx, err, "Failed to check user roles")
		return
	}

	canSeeAllEnvironments, err := rbac.HasAnyListedRole(user, rbac.Admin, rbac.IGOpsStaff, rbac.IGAdmin)
	if err != nil {
		setError(ctx, err, "Failed to check user roles")
		return
	}

	if canSeeAllEnvironments {
		projects, err = h.projectsAll(params)
	} else if isTreOpsStaff {
		projects, err = h.projectsAll(params, environments.TRE)
	} else if isDshOpsStaff {
		projects, err = h.projectsAll(params, environments.DSH)
	} else {
		// Regular user: fetch only projects they own
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
			Id:               project.ID.String(),
			Name:             project.Name,
			StudyId:          project.StudyId.String(),
			CreatorUsername:  string(project.CreatorUsername),
			CreatedAt:        openapi.FormatTime(project.CreatedAt),
			UpdatedAt:        openapi.FormatTime(project.UpdatedAt),
			EnvironmentName:  openapi.EnvironmentName(project.EnvironmentName),
			Status:           project.Status,
			LastAccessReview: openapi.FormatOptionalTime(project.LastAccessReview),
		})
	}

	ctx.JSON(http.StatusOK, response)
}

func (h *Handler) projectsProjectOwner(user types.User) ([]projects.GenericProject, error) {
	// Get project IDs where user has owner role (includes inherited via study ownership)
	projectIds, err := rbac.ProjectIDsWithRole(user, rbac.ProjectOwner)
	if err != nil {
		return []projects.GenericProject{}, err
	}

	genericProjects, err := h.projects.ProjectsById(projectIds...)
	if err != nil {
		return []projects.GenericProject{}, err
	}

	return genericProjects, nil
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

	response := openapi.ProjectTRE{
		Id:                         projectTRE.Project.ID.String(),
		Name:                       projectTRE.Project.Name,
		StudyId:                    projectTRE.Project.StudyID.String(),
		StudyTitle:                 projectTRE.Project.Study.Title,
		CreatorUsername:            string(projectTRE.Project.CreatorUser.Username),
		CreatedAt:                  openapi.FormatTime(projectTRE.Project.CreatedAt),
		UpdatedAt:                  openapi.FormatTime(projectTRE.Project.UpdatedAt),
		EnvironmentName:            openapi.EnvironmentName(projectTRE.Project.Environment.Name),
		NumRequiredEgressApprovals: projectTRE.EgressNumberRequiredApprovals,
		ExternalEncryptionEnabled:  projectTRE.ExternalEncryptionEnabled,
		AirlockOutboundWhitelist:   projectTRE.AirlockWhitelist,
		AirlockSshWhitelist:        projectTRE.AirlockSSHWhitelist,
		Status:                     openapi.ProjectTREStatus(projectTRE.Status),
		Assets:                     assets,
		Members:                    extractProjectMembers(projectTRE),
		AssetIds:                   nil,
		LastAccessReview:           openapi.FormatOptionalTime(projectTRE.Project.LastAccessReview),
	}
	if projectTRE.DeployedVersionUpdatedAt != nil &&
		projectTRE.RequestedVersionUpdatedAt != nil &&
		projectTRE.RequestedVersionUpdatedAt.After(*projectTRE.DeployedVersionUpdatedAt) {
		response.IsPendingDeploymentUpdate = true
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

	projectTRE, err := h.projects.ProjectTreById(projectUUID)
	if err != nil {
		setError(ctx, err, "Failed to get project")
		return
	}

	if err := h.projects.UpdateProjectTRE(projectTRE, projectUpdateData); err != nil {
		setError(ctx, err, "Failed to update project")
		return
	}

	ctx.Status(http.StatusOK)
}

func (h *Handler) DeleteProjectsTreProjectId(ctx *gin.Context, projectId string) {
	projectUUID, err := parseUUIDOrSetError(ctx, projectId)
	if err != nil {
		return
	}

	err = h.projects.DeleteProjectTRE(projectUUID)
	if err != nil {
		setError(ctx, err, "Failed to delete project")
		return
	}

	ctx.Status(http.StatusNoContent)
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
	for i, member := range members {
		for _, userConfig := range projectTRE.UserConfigs {
			if userConfig.User.Username == types.Username(member.Username) {
				members[i].DesktopConfig = &openapi.ProjectTREUserDesktopConfig{
					HpcInstanceType: userConfig.DesktopHPCInstanceType,
					RootVolumeGb:    optionalInt(userConfig.DesktopRootVolumeSize),
				}
			}
		}
	}

	return members
}

// Called by an IAO/IAA to confirm access rights for this project have been reviewed, resetting the review timestamp
func (h *Handler) PostProjectsTreProjectIdAccessReviewSignoff(ctx *gin.Context, projectId string) {
	projectUUID, err := parseUUIDOrSetError(ctx, projectId)
	if err != nil {
		return
	}

	if err := h.projects.RecordProjectAccessReviewSignoff(projectUUID); err != nil {
		setError(ctx, err, "Failed to record project access review signoff")
		return
	}

	ctx.Status(http.StatusOK)
}

func (h *Handler) PatchProjectsTreProjectIdPending(ctx *gin.Context, projectId string) {
	projectUUID, err := parseUUIDOrSetError(ctx, projectId)
	if err != nil {
		return
	}

	err = h.projects.SubmitProjectTre(projectUUID)
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

	user := middleware.GetUser(ctx)
	err = h.projects.ApproveProject(projectUUID, user)
	if err != nil {
		setError(ctx, err, "Failed to approve project")
		return
	}

	ctx.Status(http.StatusOK)
}

func (h *Handler) PostProjectsTreAdminImport(ctx *gin.Context) {
	data := openapi.ProjectTREImport{}
	if err := bindJSONOrSetError(ctx, &data); err != nil {
		return
	}

	err := h.projects.ImportProjectTRE(data)
	if err != nil {
		setError(ctx, err, "Failed to import project")
		return
	}
	ctx.Status(http.StatusNoContent)
}

func (h *Handler) GetProjectsDshProjectId(ctx *gin.Context, projectId string) {
	projectUUID, err := parseUUIDOrSetError(ctx, projectId)
	if err != nil {
		return
	}

	projectDSH, err := h.projects.ProjectDSHById(projectUUID)
	if err != nil {
		setError(ctx, err, "Failed to get project")
		return
	}

	members := map[types.Username]openapi.ProjectDSHMember{}
	for _, roleBinding := range projectDSH.RoleBindings {
		role := openapi.ProjectDSHRole(roleBinding.Role)
		member, exists := members[roleBinding.User.Username]
		if exists {
			member.Roles = append(members[roleBinding.User.Username].Roles, role)
		} else {
			member.Roles = []openapi.ProjectDSHRole{role}
		}
		members[roleBinding.User.Username] = member
	}

	response := openapi.ProjectDSH{
		Name:             projectDSH.Project.Name,
		Id:               projectUUID.String(),
		EnvironmentName:  string(environments.DSH),
		StudyId:          projectDSH.Project.Study.ID.String(),
		StudyTitle:       projectDSH.Project.Study.Title,
		Assets:           new([]openapi.Asset{}),
		Status:           openapi.ProjectDSHStatus(projectDSH.Status),
		LastAccessReview: openapi.FormatOptionalTime(projectDSH.Project.LastAccessReview),
		Members:          []openapi.ProjectDSHMember{},
	}
	for username, member := range members {
		response.Members = append(response.Members, openapi.ProjectDSHMember{
			Username: string(username),
			Roles:    member.Roles,
		})
	}
	ctx.JSON(http.StatusOK, response)
}

// Called by an IAO/IAA to confirm access rights for this project have been reviewed, resetting the review timestamp
func (h *Handler) PostProjectsDshProjectIdAccessReviewSignoff(ctx *gin.Context, projectId string) {
	projectUUID, err := parseUUIDOrSetError(ctx, projectId)
	if err != nil {
		return
	}

	if err := h.projects.RecordProjectAccessReviewSignoff(projectUUID); err != nil {
		setError(ctx, err, "Failed to record project access review signoff")
		return
	}

	ctx.Status(http.StatusOK)
}

func optionalInt(i *uint) *int {
	if i == nil {
		return nil
	}
	return new(int(*i))
}
