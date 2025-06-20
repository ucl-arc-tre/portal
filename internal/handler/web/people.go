package handler

import (
	"net/http"
	"slices"
	"time"

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

func (h *Handler) PostPeopleUpdate(ctx *gin.Context, params openapi.PostPeopleUpdateParams) {
	user := middleware.GetUser(ctx)
	roles, err := rbac.GetRoles(user)
	if err != nil {
		setServerError(ctx, err, "Failed to get roles for user")
		return
	}

	if slices.Contains(roles, "admin") {
		update := openapi.PersonUpdate{}
		if err := ctx.ShouldBindJSON(&update); err != nil {
			setInvalid(ctx, err, "Invalid JSON object")
			return
		}

		// take the username from the query and get the person
		id := params.Id
		person, err := h.users.GetPerson(id)
		if err != nil {
			setServerError(ctx, err, "Failed to get person")
			return
		}

		if update.Username != nil {
			username := *update.Username
			if err := h.users.SetUserUsername(person, types.Username(username)); err != nil {
				setServerError(ctx, err, "Failed to update username")
			}
		}

		if update.TrainingKind != nil {
			// if there's a date, set the date to that, otherwise use today, now?
			var date string
			if update.TrainingDate != nil {
				date = *update.TrainingDate
			} else {
				date = time.Now().Format(time.RFC3339)
			}

			if err := h.users.SetTrainingValidity(person, types.TrainingKind(*update.TrainingKind), (date)); err != nil {
				setServerError(ctx, err, "Failed to update agreement validity")
			}

		}

	} else {
		ctx.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
	}

}
