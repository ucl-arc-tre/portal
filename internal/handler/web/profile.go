package web

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func (h *Handler) GetProfile(ctx *gin.Context) {
	user := middleware.GetUser(ctx)
	attributes, err := h.users.Attributes(user)
	if err != nil {
		setError(ctx, err, "Failed to get user attributes")
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
	if err := bindJSONOrSetError(ctx, &update); err != nil {
		return
	}
	if err := h.users.SetUserChosenName(user, types.ChosenName(update.ChosenName)); err != nil {
		setError(ctx, err, "Failed to update chosen name")
		return
	}
	ctx.JSON(http.StatusOK, openapi.ProfileUpdate{
		ChosenName: update.ChosenName,
	})
}

func (h *Handler) PostProfileAgreements(ctx *gin.Context) {
	user := middleware.GetUser(ctx)
	confirmation := openapi.AgreementConfirmation{}
	if err := bindJSONOrSetError(ctx, &confirmation); err != nil {
		return
	}
	agreementId, err := uuid.Parse(confirmation.AgreementId)
	if err != nil {
		setError(ctx, types.NewErrInvalidObject(err), "Invalid agreement ID")
		return
	}
	if err := h.users.ConfirmAgreement(user, agreementId); err != nil {
		setError(ctx, err, "Failed to confirm agreement")
		return
	}
	ctx.Status(http.StatusOK)
}

func (h *Handler) GetProfileAgreements(ctx *gin.Context) {
	user := middleware.GetUser(ctx)
	agreements, err := h.users.ConfirmedAgreements(user)
	if err != nil {
		setError(ctx, err, "Failed to get agreements")
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
		setError(ctx, err, "Failed to get training status")
		return
	}
	ctx.JSON(http.StatusOK, status)
}

func (h *Handler) PostProfileTraining(ctx *gin.Context) {
	user := middleware.GetUser(ctx)
	data := openapi.ProfileTrainingUpdate{}
	if err := bindJSONOrSetError(ctx, &data); err != nil {
		return
	}
	result, err := h.users.UpdateTraining(user, data)
	if err != nil {
		setError(ctx, err, "Failed to update users training")
		return
	}
	ctx.JSON(http.StatusOK, result)
}
