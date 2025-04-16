package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
)

func (h *Handler) GetAgreementsApprovedResearcher(ctx *gin.Context) {
	agreement, err := h.agreements.LatestApprovedResearcher()
	if err != nil {
		log.Err(err).Msg("Failed to get approved researcher agreement")
		ctx.Status(http.StatusInternalServerError)
		return
	}
	ctx.JSON(http.StatusOK, openapi.Agreement{
		Id:   agreement.ID.String(),
		Text: agreement.Text,
	})
}
