package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
)

func (h *Handler) GetAgreementsApprovedResearcher(ctx *gin.Context) {
	agreement, err := h.agreements.LatestApprovedResearcher()
	if err != nil {
		setServerError(ctx, err, "Failed to get approved researcher agreement")
		return
	}
	ctx.JSON(http.StatusOK, openapi.Agreement{
		Id:   agreement.ID.String(),
		Text: agreement.Text,
	})
}

// PostProfileAgreements allows a user to confirm an agreement by its ID.
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

// GetProfileAgreements retrieves all agreements confirmed by the user.
func (h *Handler) GetProfileAgreements(ctx *gin.Context) {
	user := middleware.GetUser(ctx)
	agreements, err := h.users.ConfirmedAgreements(user)
	if err != nil {
		setServerError(ctx, err, "Failed to get agreements")
		return
	}
	ctx.JSON(http.StatusOK, openapi.ProfileAgreements{
		ConfirmedAgreements: agreements,
	})
}
