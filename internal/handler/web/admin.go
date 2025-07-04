package handler

import (
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (h *Handler) PostPeopleApprovedResearchersImportCsv(ctx *gin.Context) {
	content, err := io.ReadAll(ctx.Request.Body)
	if err != nil {
		setServerError(ctx, err, "Failed to read body")
		return
	}
	agreement, err := h.agreements.LatestApprovedResearcher()
	if err != nil {
		setServerError(ctx, err, "Failed to get approved researcher agreement")
		return
	}
	if err := h.users.ImportApprovedResearchersCSV(content, *agreement); err != nil {
		setServerError(ctx, err, "Failed to import")
		return
	}
	ctx.Status(http.StatusNoContent)
}
