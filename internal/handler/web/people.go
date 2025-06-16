package handler

import (
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
		// retrieve auth + agreements info
		people, err := h.people.GetAllPeople()
		if err != nil {
			setServerError(ctx, err, "Failed to get people")
			return
		}

		ctx.JSON(http.StatusOK, openapi.PeopleAdminResponse{
			People: people,
		})

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
		username := params.Username
		person, err := h.people.GetPerson(types.Username(username))
		if err != nil {
			setServerError(ctx, err, "Failed to get person")
			return
		}

		if update.ChosenName != nil {
			chosenName := *update.ChosenName
			if err := h.profile.SetUserChosenName(person, types.ChosenName(chosenName)); err != nil {
				setServerError(ctx, err, "Failed to update chosen name")
				return // will this stop the rest of the code from running?
			}
		}

		// if update.TrainingKind != nil {
		// if there's a date, set the date to that, otherwise use today, now?

		// h.people.SetTrainingValidity(person, types.TrainingKind(*update.TrainingKind))

		// }

	} else {
		ctx.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
	}

}
