package web

import (
	"io"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/service/users"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func (h *Handler) GetUsers(ctx *gin.Context, params openapi.GetUsersParams) {
	people, err := h.users.Find(ctx, params.Find)
	if err != nil {
		setError(ctx, err, "Failed to find people in tenant")
		return
	}
	ctx.JSON(http.StatusOK, people)
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

	uid, err := uuid.Parse(userId)
	if err != nil {
		setError(ctx, types.NewErrInvalidObject(err), "Invalid uuid")
		return
	}
	user, err := h.users.UserById(uid)
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
	user := middleware.GetUser(ctx)
	if err := h.users.ImportApprovedResearchersCSV(ctx, user, content, *agreement); err != nil {
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

	if exists, err := h.users.UserExistsWithEmailOrUsername(ctx, invite.Email); err != nil {
		setError(ctx, err, "Failed to check user existence")
		return
	} else if exists {
		log.Debug().Any("email", invite.Email).Msg("User already exists - not inviting")
		ctx.Status(http.StatusNoContent)
		return
	}

	inviter := middleware.GetUser(ctx)
	if _, err := h.users.InviteExternalUser(ctx, invite.Email, inviter); err != nil {
		setError(ctx, err, "Failed to send invite")
		return
	}

	ctx.Status(http.StatusNoContent)
}

func (h *Handler) PutUsersUserIdAttributes(ctx *gin.Context, userId string) {
	var requestBody openapi.PutUsersUserIdAttributesJSONRequestBody
	if err := bindJSONOrSetError(ctx, &requestBody); err != nil {
		return
	}

	userID, err := uuid.Parse(userId)
	if err != nil {
		setError(ctx, types.NewErrInvalidObject(err), "Invalid user ID")
		return
	}

	targetUser, err := h.users.UserById(userID)
	if err != nil {
		setError(ctx, err, "Failed to find user")
		return
	}

	if err := h.users.SetUserChosenName(*targetUser, types.ChosenName(requestBody.ChosenName)); err != nil {
		setError(ctx, err, "Failed to update chosen name")
		return
	}

	ctx.Status(http.StatusOK)
}

func (h *Handler) GetUsersMetrics(ctx *gin.Context) {
	metrics, err := h.users.Metrics()
	if err != nil {
		setError(ctx, err, "Failed to get user metrics")
		return
	}
	ctx.JSON(http.StatusOK, metrics)
}
