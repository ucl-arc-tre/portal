package web

import (
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/service/users"
	"github.com/ucl-arc-tre/portal/internal/types"

	"github.com/ucl-arc-tre/portal/internal/rbac"
)

func (h *Handler) GetUsers(ctx *gin.Context) {
	user := middleware.GetUser(ctx)
	isAdmin, err := rbac.HasRole(user, rbac.Admin)
	if err != nil {
		setError(ctx, err, "Failed to get roles for user")
		return
	}

	if isAdmin {
		// retrieve auth + agreements + training info
		people, err := h.users.AllUsers()
		if err != nil {
			setError(ctx, err, "Failed to get people")
			return
		}
		ctx.JSON(http.StatusOK, people)

	} else {
		ctx.JSON(http.StatusInternalServerError, "Not implemented")
	}
}

func (h *Handler) PostUsersUserIdTraining(ctx *gin.Context, userId string) {
	var update openapi.UserTrainingUpdate
	if err := bindJSONOrSetError(ctx, &update); err != nil {
		return
	}

	trainingDate, err := time.Parse(config.TimeFormat, update.TrainingDate)
	if err != nil {
		setError(ctx, types.NewErrInvalidObject(err), "Failed to parse date")
		return
	}

	user, err := h.users.UserById(userId)
	if err != nil {
		setError(ctx, err, "Failed to get person")
		return
	}

	switch update.TrainingKind {
	case openapi.TrainingKindNhsd:
		if err := h.users.CreateNHSDTrainingRecord(*user, trainingDate); err != nil {
			setError(ctx, err, "Failed to update training validity")
			return
		}
	default:
		panic("unsupported training kind")
	}

	ctx.JSON(http.StatusOK, openapi.TrainingRecord{
		Kind:        update.TrainingKind,
		CompletedAt: &update.TrainingDate,
		IsValid:     users.NHSDTrainingIsValid(trainingDate),
	})
}

func (h *Handler) PostUsersApprovedResearchersImportCsv(ctx *gin.Context) {
	content, err := io.ReadAll(ctx.Request.Body)
	if err != nil {
		setError(ctx, types.NewErrServerError(err), "Failed to read body")
		return
	}
	agreement, err := h.agreements.LatestApprovedResearcher()
	if err != nil {
		setError(ctx, err, "Failed to get approved researcher agreement")
		return
	}
	if err := h.users.ImportApprovedResearchersCSV(content, *agreement); err != nil {
		setError(ctx, err, "Failed to import")
		return
	}
	ctx.Status(http.StatusNoContent)
}

func (h *Handler) PostUsersInvite(ctx *gin.Context) {
	var invite openapi.PostUsersInviteJSONRequestBody
	if err := bindJSONOrSetError(ctx, &invite); err != nil {
		return
	}

	user := middleware.GetUser(ctx)
	attributes, err := h.users.Attributes(user)
	if err != nil {
		setError(ctx, err, "Failed to get user attributes")
		return
	}

	sponsor := types.Sponsor{
		Username:   user.Username,
		ChosenName: attributes.ChosenName,
	}

	invitedUser, userWasCreated, err := h.users.PersistedUser(types.Username(invite.Email))
	if err != nil {
		setError(ctx, err, "Failed to get or create invitee")
		return
	}

	if _, err := h.users.CreateUserSponsorship(invitedUser.ID, user.ID); err != nil {
		setError(ctx, err, "Failed to connect sponsorship")
		return
	}

	if userWasCreated {

		if err := h.users.InviteUser(ctx, invite.Email, sponsor); err != nil {
			setError(ctx, err, "Failed to send invite")
			return
		}

	}

	if err := h.users.AddtoInvitedUserGroup(ctx, invite.Email); err != nil {
		if strings.Contains(err.Error(), "One or more added object references already exist for the following modified properties") {
			log.Warn().Msg("User is already in group")
			return
		}

		setError(ctx, err, "Failed to update entra group")
		return
	}

	ctx.Status(http.StatusNoContent)
}
