package web

import (
	"io"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/controller/entra"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/service/users"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func (h *Handler) GetUsers(ctx *gin.Context, params openapi.GetUsersParams) {
	users, err := h.users.Find(ctx, params.Find)
	if err != nil {
		setError(ctx, err, "Failed to find users")
		return
	}
	ctx.JSON(http.StatusOK, users)
}

func (h *Handler) GetUsersUserId(ctx *gin.Context, userId string) {
	id, err := parseUUIDOrSetError(ctx, userId)
	if err != nil {
		return
	}
	userData, err := h.users.UserDataById(id)
	if err != nil {
		setError(ctx, err, "Failed to find users")
		return
	}
	ctx.JSON(http.StatusOK, userData)
}

func (h *Handler) GetUsersLookup(ctx *gin.Context, params openapi.GetUsersLookupParams) {
	usersData, err := h.users.Find(ctx, params.Find)
	if err != nil {
		setError(ctx, err, "Failed to find users")
		return
	}
	users := []openapi.UserDataLookup{}
	for _, userData := range usersData {
		users = append(users, openapi.UserDataLookup{
			ChosenName:                userData.ChosenName,
			IsValidApprovedResearcher: userData.IsValidApprovedResearcher,
			Username:                  userData.User.Username,
		})
	}
	ctx.JSON(http.StatusOK, users)
}

func (h *Handler) PostUsersUserIdTraining(ctx *gin.Context, userId string) {
	var update openapi.UserTrainingUpdate
	if err := bindJSONOrSetError(ctx, &update); err != nil {
		return
	}
	if !update.TrainingKind.Valid() {
		setError(ctx, types.NewErrClientInvalidObjectF("invalid training kind"), "Invalid training kind")
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

	if err := h.users.CreateTrainingRecord(*user, update.TypesTrainingKind(), trainingDate); err != nil {
		setError(ctx, err, "Failed to update training validity")
		return
	}

	ctx.JSON(http.StatusOK, openapi.TrainingRecord{
		Kind:        update.TrainingKind,
		CompletedAt: &update.TrainingDate,
		IsValid:     users.TrainingIsValid(trainingDate),
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
	data := openapi.PostUsersInviteJSONRequestBody{}
	if err := bindJSONOrSetError(ctx, &data); err != nil {
		return
	}

	inviter := middleware.GetUser(ctx)
	attributes, err := h.users.Attributes(inviter)
	if err != nil {
		setError(ctx, err, "Failed to get user attributes")
		return
	}
	invite := entra.Invite{
		Recipient: data.Email,
		Sponsor: types.Sponsor{
			User:       inviter,
			ChosenName: attributes.ChosenName,
		},
		StudyName:   data.StudyName,
		ProjectName: data.ProjectName,
	}

	if exists, err := h.users.UserExistsWithEmailOrUsername(ctx, invite.Recipient); err != nil {
		setError(ctx, err, "Failed to check user existence")
		return
	} else if exists {
		log.Debug().Any("email", invite.Recipient).Msg("User already exists - not inviting")
		ctx.Status(http.StatusNoContent)
		return
	}

	if _, err := h.users.InviteUser(ctx, invite); err != nil {
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
