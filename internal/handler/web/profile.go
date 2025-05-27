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
	attributes, err := h.profile.Attributes(user)
	if err != nil {
		log.Err(err).Msg("Failed to get user attributes")
		ctx.Status(http.StatusInternalServerError)
		return
	}
	ctx.JSON(http.StatusOK, openapi.ProfileResponse{
		Username:   string(user.Username),
		ChosenName: string(attributes.ChosenName),
	})
}

func (h *Handler) PostProfile(ctx *gin.Context) {
	user := middleware.GetUser(ctx)
	update := openapi.ProfileUpdate{}
	if err := ctx.ShouldBindJSON(&update); err != nil {
		log.Err(err).Msg("Invalid JSON object")
		ctx.Status(http.StatusNotAcceptable)
		return
	}
	if err := h.profile.SetUserChosenName(user, types.ChosenName(update.ChosenName)); err != nil {
		log.Err(err).Msg("Failed to update chosen name")
		ctx.Status(http.StatusInternalServerError)
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
		setInvalidResponse(ctx, err, "Invalid JSON object")
		return
	}
	agreementId, err := uuid.Parse(confirmation.AgreementId)
	if err != nil {
		log.Err(err).Msg("Invalid agreemenet ID")
		ctx.Status(http.StatusNotAcceptable)
		return
	}
	if err := h.profile.ConfirmAgreement(user, agreementId); err != nil {
		log.Err(err).Msg("Failed to confirm agreement")
		ctx.Status(http.StatusInternalServerError)
		return
	}
	ctx.Status(http.StatusOK)
}

func (h *Handler) GetProfileAgreements(ctx *gin.Context) {
	user := middleware.GetUser(ctx)
	agreements, err := h.profile.ConfirmedAgreements(user)
	if err != nil {
		log.Err(err).Msg("Failed to get agreements")
		ctx.Status(http.StatusInternalServerError)
		return
	}
	ctx.JSON(http.StatusOK, openapi.ProfileAgreements{
		ConfirmedAgreements: agreements,
	})
}

func (h *Handler) PostProfileTraining(ctx *gin.Context) {
	user := middleware.GetUser(ctx)
	data := openapi.ProfileTrainingUpdate{}
	if err := ctx.ShouldBindJSON(&data); err != nil {
		setInvalidResponse(ctx, err, "Invalid JSON object")
		return
	}
	result, err := h.training.Update(user, data)
	if err != nil {
		log.Err(err).Any("username", user.Username).Msg("Failed to update users training")
		ctx.Status(http.StatusInternalServerError)
		return
	}
	ctx.JSON(http.StatusOK, result)
}

func setInvalidResponse(ctx *gin.Context, err error, message string) {
	if err != nil {
		log.Err(err).Msg(message)
		ctx.Status(http.StatusNotAcceptable)
	}
}
