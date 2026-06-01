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

func (h *Handler) GetUserStatus(ctx *gin.Context, params openapi.GetUserStatusParams) {
	user, err := h.users.UserByUsername(types.Username(params.Username))
	if errors.Is(err, types.ErrNotFound) {
		ctx.Status(http.StatusNotFound)
		return
	} else if err != nil {
		log.Err(err).Any("params", params).Msg("Failed to get user")
		ctx.Status(http.StatusInternalServerError)
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
	if expiresAt, err := h.users.NHSDTrainingExpiresAt(*user); errors.Is(err, types.ErrNotFound) {
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

func (h *Handler) PostProjectsProjectNameStatus(ctx *gin.Context, projectName string) {
	data := openapi.ProjectStatusUpdate{}
	if err := ctx.ShouldBindBodyWithJSON(&data); err != nil {
		log.Err(err).Str("projectName", projectName).Msg("Failed to bind ProjectStatusUpdate")
		ctx.Status(http.StatusNotAcceptable)
		return
	}
	status := types.ProjectTREStatus(data.Status)
	if !data.Status.Valid() {
		ctx.Status(http.StatusNotAcceptable)
		return
	} else if status != types.ProjectTREStatusDeployed && status != types.ProjectTREStatusDeleted {
		setError(ctx, types.NewErrInvalidObjectF("Status can only be deployed or deleted, was [%s]", status))
		return
	}

	err := h.projects.UpdateProjectTREStatus(projectName, status)
	if err != nil {
		setError(ctx, err)
		return
	}
	ctx.Status(http.StatusNoContent)
}
