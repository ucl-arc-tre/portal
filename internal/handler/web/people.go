package handler

import (
	"io"
	"net/http"
	"slices"

	"github.com/gin-gonic/gin"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"

	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func (h *Handler) GetPeople(ctx *gin.Context) {
	user := middleware.GetUser(ctx)
	roles, err := rbac.GetRoles(user)
	if err != nil {
		setServerError(ctx, err, "Failed to get roles for user")
		return
	}

	if slices.Contains(roles, "admin") {
		// retrieve auth + agreements + training info
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

func (h *Handler) PostPeopleId(ctx *gin.Context, id string) {
	var update openapi.PersonUpdate
	if err := ctx.ShouldBindJSON(&update); err != nil {
		setInvalid(ctx, err, "Invalid JSON object")
		return
	}

	// take the id from the url and get the person
	person, err := h.users.GetPerson(id)
	if err != nil {
		setServerError(ctx, err, "Failed to get person")
		return
	}

	if update.TrainingKind != nil {
		date := *update.TrainingDate

		if err := h.users.SetTrainingValidity(person, types.TrainingKind(*update.TrainingKind), (date)); err != nil {
			setServerError(ctx, err, "Failed to update training validity")
		}
		ctx.JSON(http.StatusOK, openapi.TrainingRecord{
			Kind:        *update.TrainingKind,
			CompletedAt: &date,
			IsValid:     true,
		})
	}
}

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
