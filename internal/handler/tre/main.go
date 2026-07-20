package tre

import (
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/tre"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/service/projects"
	"github.com/ucl-arc-tre/portal/internal/service/users"
	"github.com/ucl-arc-tre/portal/internal/types"
)

type Handler struct {
	users    *users.Service
	projects *projects.Service
}

func New() *Handler {
	log.Info().Msg("Creating TRE handler")
	return &Handler{users: users.New(), projects: projects.New()}
}

func (h *Handler) GetPing(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, openapi.Ping{Message: "pong"})
}

func (h *Handler) GetUserStatus(ctx *gin.Context, params openapi.GetUserStatusParams) {
	user, err := h.users.UserByUsername(types.Username(params.Username))
	if err != nil {
		setError(ctx, err)
		return
	}
	userStatus := openapi.UserStatus{}
	if isApprovedResearcher, err := rbac.HasRole(*user, rbac.ApprovedResearcher); err != nil {
		log.Err(err).Any("username", user.Username).Msg("Failed to get role for user")
		ctx.Status(http.StatusInternalServerError)
		return
	} else {
		userStatus.IsApprovedResearcher = isApprovedResearcher
	}
	if expiresAt, err := h.users.TrainingExpiresAt(*user, types.TrainingKindNHSD); errors.Is(err, types.ErrNotFound) {
		log.Trace().Msg("User missing NHSD training date")
	} else if err != nil {
		log.Err(err).Any("username", user.Username).Msg("Failed to get training expiry for user")
		ctx.Status(http.StatusInternalServerError)
		return
	} else {
		userStatus.NhsdTrainingExpiresAt = new(expiresAt.Format(config.TimeFormat))
	}
	ctx.JSON(http.StatusOK, userStatus)
}

func (h *Handler) GetProjects(c *gin.Context) {
	projectTREs, err := h.projects.AllProjectTREs()
	if err != nil {
		setError(c, err)
		return
	}

	response := make([]openapi.Project, 0, len(projectTREs))
	for _, tre := range projectTREs {
		response = append(response, toApiProjectResponse(tre))
	}
	c.JSON(http.StatusOK, response)
}

func (h *Handler) PostProjectsProjectName(ctx *gin.Context, projectName string) {
	data := openapi.ProjectUpdate{}
	if err := ctx.ShouldBindBodyWithJSON(&data); err != nil {
		setError(ctx, types.NewErrInvalidObject("failed to bind ProjectUpdate"))
		return
	}
	err := h.projects.UpdateProjectTREDeployed(projectName, data)
	if err != nil {
		setError(ctx, err)
		return
	}
	ctx.Status(http.StatusNoContent)
}

func (h *Handler) PostVmImages(ctx *gin.Context) {
	data := openapi.VMImage{}
	if err := ctx.ShouldBindBodyWithJSON(&data); err != nil {
		setError(ctx, types.NewErrInvalidObject("failed to bind VMImage"))
		return
	}

	err := h.projects.CreateTREVMImage(data)
	if err != nil {
		setError(ctx, err)
		return
	}
	ctx.Status(http.StatusNoContent)
}

// Convert TRE project to API project response type
func toApiProjectResponse(projectTRE types.ProjectTRE) openapi.Project {
	project := openapi.Project{
		Name:                          projectTRE.Project.Name,
		Platform:                      string(projectTRE.Platform),
		MonthlyBudget:                 float32(projectTRE.MonthlyBudget),
		EncryptionKeyEnabled:          projectTRE.ExternalEncryptionEnabled,
		Owners:                        projectOwners(projectTRE),
		Usernames:                     map[string]string{},                      // Filled below
		UserPrincipals:                &map[string]string{},                     // Filled below
		Uids:                          map[string]int{},                         // Filled below
		ApiUsers:                      []string{},                               // Filled below
		Uploaders:                     []string{},                               // Filled below
		Downloaders:                   []string{},                               // Filled below
		EgressRequesters:              []string{},                               // Filled below
		EgressCheckers:                []string{},                               // Filled below
		DesktopUsers:                  []string{},                               // Filled below
		DesktopInstanceTypes:          map[string]openapi.DesktopInstanceType{}, // Filled below
		EgressNumberRequiredApprovals: projectTRE.EgressNumberRequiredApprovals,
		Airlock: openapi.Airlock{
			HttpEnabled: true,
			SftpEnabled: true,
			SshEnabled:  projectTRE.AirlockSSHEnabled,
			Whitelist:   projectTRE.AirlockWhitelist,
		},
		RequestedVersionUpdatedAt: requestedVersionUpdatedAt(projectTRE),
	}

	// Populate user configs
	for _, config := range projectTRE.UserConfigs {
		username := string(config.User.Username)

		// User identities
		project.Usernames[username] = string(config.User.Username.LocalPart())
		project.Uids[username] = int(config.UID)
		// TODO: populate project.UserPrincipals

		// Desktop instance types
		desktopInstanceType := openapi.DesktopInstanceType{}
		if config.DesktopStandardInstanceType != nil {
			desktopInstanceType.Standard = *config.DesktopStandardInstanceType
		}
		if config.DesktopHPCInstanceType != nil {
			desktopInstanceType.Hpc = *config.DesktopHPCInstanceType
		}
		if config.DesktopImage != nil {
			desktopInstanceType.Image = config.DesktopImage.ImageId
		}
		if config.DesktopHomeVolumeSize != nil {
			homeVolGB := int(*config.DesktopHomeVolumeSize)
			desktopInstanceType.HomeVolumeGb = &homeVolGB
		}
		project.DesktopInstanceTypes[username] = desktopInstanceType
	}

	// Unwind role bindings into individual user lists
	for _, binding := range projectTRE.TRERoleBindings {
		username := string(binding.User.Username)
		switch binding.Role {
		case types.ProjectTREIngresser:
			project.Uploaders = append(project.Uploaders, username)
		case types.ProjectTREEgresser:
			project.Downloaders = append(project.Downloaders, username)
		case types.ProjectTREEgressRequester:
			project.EgressRequesters = append(project.EgressRequesters, username)
		case types.ProjectTREEgressChecker:
			project.EgressCheckers = append(project.EgressCheckers, username)
		case types.ProjectTREDesktopUser:
			project.DesktopUsers = append(project.DesktopUsers, username)
		case types.ProjectTREAPIUser:
			project.ApiUsers = append(project.ApiUsers, username)
		}
	}
	return project
}

func projectOwners(projectTRE types.ProjectTRE) []string {
	owners := projectTRE.Project.Study.AdminUsernames()
	owners = append(owners, string(projectTRE.Project.Study.Owner.Username))
	return owners
}

func requestedVersionUpdatedAt(projectTRE types.ProjectTRE) string {
	if projectTRE.RequestedVersionUpdatedAt != nil {
		return projectTRE.RequestedVersionUpdatedAt.Format(time.RFC3339)
	}
	return ""
}
