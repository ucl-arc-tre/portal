package web

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func (h *Handler) GetAgreementsAgreementType(ctx *gin.Context, agreementType openapi.AgreementType) {
	var agreement *types.Agreement
	var err error

	switch agreementType {
	case openapi.AgreementTypeApprovedResearcher:
		agreement, err = h.agreements.LatestApprovedResearcher()
	case openapi.AgreementTypeStudyOwner:
		agreement, err = h.agreements.LatestStudyOwner()
	default:
		err = types.NewNotFoundError("agreement type not found")
	}

	if err != nil {
		setError(ctx, err, fmt.Sprintf("Failed to get agreement of type [%v]", agreementType))
		return
	}
	ctx.JSON(http.StatusOK, openapi.Agreement{
		Id:   agreement.ID.String(),
		Text: agreement.Text,
	})
}
