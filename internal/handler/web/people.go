package handler

import (
	"io"
	"net/http"
	"slices"

	"github.com/gin-gonic/gin"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	"github.com/ucl-arc-tre/portal/internal/rbac"
)

func (h *Handler) GetPeople(ctx *gin.Context) {
	user := middleware.GetUser(ctx)
	roles, err := rbac.GetRoles(user)
	if err != nil {
		setServerError(ctx, err, "Failed to get roles for user")
		return
	}

	if slices.Contains(roles, "admin") {
		// retrieve auth + agreements info
		people, err := h.users.GetAllPeople()
		if err != nil {
			setServerError(ctx, err, "Failed to get people")
			return
		}
		ctx.JSON(http.StatusOK, people)

	} else {
		ctx.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
	}

}

func (h *Handler) PostPeopleApprovedResearchersImportCsv(ctx *gin.Context) {
	content, err := io.ReadAll(ctx.Request.Body)
	if err != nil {
		setServerError(ctx, err, "Failed to read body")
		return
	}
	if err := h.users.ImportApprovedResearchersCSV(content); err != nil {
		setServerError(ctx, err, "Failed to import")
		return
	}
	ctx.Status(http.StatusNoContent)
}
