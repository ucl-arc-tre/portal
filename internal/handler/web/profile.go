package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/rbac"
)

func (h *Handler) GetProfile(ctx *gin.Context) {
	user := middleware.GetUser(ctx)
	roles, err := rbac.GetRoles(user)
	if err != nil {
		log.Err(err).Any("username", user.Username).Msg("Failed to get roles for user")
		ctx.Status(http.StatusInternalServerError)
		return
	}
	ctx.JSON(http.StatusOK, openapi.ProfileResponse{
		Username: string(user.Username),
		Roles:    roles,
	})
}

func (h *Handler) PostProfileAgreements(ctx *gin.Context) {
	user := middleware.GetUser(ctx)
	confirmation := openapi.AgreementConfirmation{}
	if err := ctx.ShouldBindJSON(&confirmation); err != nil {
		log.Err(err).Msg("Invalid JSON object")
		ctx.Status(http.StatusNotAcceptable)
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
