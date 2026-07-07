package tre

import (
	"errors"
	"net/http"

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

func (h *Handler) PostProjectsProjectName(ctx *gin.Context, projectName string) {
	data := openapi.ProjectUpdate{}
	if err := ctx.ShouldBindBodyWithJSON(&data); err != nil {
		setError(ctx, types.NewErrInvalidObject("failed to bind ProjectStatusUpdate"))
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
