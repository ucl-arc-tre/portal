package web

import (
	"net/http"

	"github.com/gin-gonic/gin"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
)

func (h *Handler) GetAgreementsAgreementType(ctx *gin.Context, agreementType openapi.AgreementType) {
	switch agreementType {
	case openapi.AgreementTypeApprovedResearcher:
		agreement, err := h.agreements.LatestApprovedResearcher()
		if err != nil {
			setServerError(ctx, err, "Failed to get approved researcher agreement")
			return
		}
		ctx.JSON(http.StatusOK, openapi.Agreement{
			Id:   agreement.ID.String(),
			Text: agreement.Text,
		})
	default:
		ctx.JSON(http.StatusOK, http.StatusNotFound)
		return
	}

}
