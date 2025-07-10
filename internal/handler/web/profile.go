package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func (h *Handler) GetProfile(ctx *gin.Context) {
	user := middleware.GetUser(ctx)
	attributes, err := h.users.Attributes(user)
	if err != nil {
		log.Err(err).Msg("Failed to get user attributes")
		ctx.Status(http.StatusInternalServerError)
		return
	}
	ctx.JSON(http.StatusOK, openapi.Profile{
		Username:   string(user.Username),
		ChosenName: string(attributes.ChosenName),
	})
}

func (h *Handler) PostProfile(ctx *gin.Context) {
	user := middleware.GetUser(ctx)
	update := openapi.ProfileUpdate{}
	if err := ctx.ShouldBindJSON(&update); err != nil {
		setInvalid(ctx, err, "Invalid JSON object")
		return
	}
	if err := h.users.SetUserChosenName(user, types.ChosenName(update.ChosenName)); err != nil {
		setServerError(ctx, err, "Failed to update chosen name")
		return
	}
	ctx.JSON(http.StatusOK, openapi.ProfileUpdate{
		ChosenName: update.ChosenName,
	})
}

func (h *Handler) PostProfileAgreements(ctx *gin.Context) {
	user := middleware.GetUser(ctx)
	confirmation := openapi.AgreementConfirmation{}
	if err := ctx.ShouldBindJSON(&confirmation); err != nil {
		setInvalid(ctx, err, "Invalid JSON object")
		return
	}
	agreementId, err := uuid.Parse(confirmation.AgreementId)
	if err != nil {
		setInvalid(ctx, err, "Invalid agreemenet ID")
		return
	}
	if err := h.users.ConfirmAgreement(user, agreementId); err != nil {
		ctx.Status(http.StatusInternalServerError)
		setServerError(ctx, err, "Failed to confirm agreement")
		return
	}
	ctx.Status(http.StatusOK)
}

func (h *Handler) GetProfileAgreements(ctx *gin.Context) {
	user := middleware.GetUser(ctx)
	agreements, err := h.users.ConfirmedAgreements(user)
	if err != nil {
		setServerError(ctx, err, "Failed to get agreements")
		return
	}
	ctx.JSON(http.StatusOK, openapi.UserAgreements{
		ConfirmedAgreements: agreements,
	})
}

func (h *Handler) GetProfileTraining(ctx *gin.Context) {
	user := middleware.GetUser(ctx)
	status, err := h.users.GetTrainingRecord(user)
	if err != nil {
		setServerError(ctx, err, "Failed to get training status")
		return
	}
	ctx.JSON(http.StatusOK, status)
}

func (h *Handler) PostProfileTraining(ctx *gin.Context) {
	user := middleware.GetUser(ctx)
	data := openapi.ProfileTrainingUpdate{}
	if err := ctx.ShouldBindJSON(&data); err != nil {
		setInvalid(ctx, err, "Invalid JSON object")
		return
	}
	result, err := h.users.UpdateTraining(user, data)
	if err != nil {
		setServerError(ctx, err, "Failed to update users training")
		return
	}
	ctx.JSON(http.StatusOK, result)
}
