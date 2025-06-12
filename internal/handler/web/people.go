package handler

import (
	"net/http"
	"slices"

	"github.com/gin-gonic/gin"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
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
