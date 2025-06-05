package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
)

func (h *Handler) GetPeople(ctx *gin.Context, params openapi.GetPeopleParams) {
	role := params.Role
	switch role {

	case "admin":
		// retrieve auth + agreements info
		users, err := h.people.GetAllPeople() // Make sure GetAllPeople returns ([]User, error)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusOK, users)
		return
	case "approvedResearcher":
		// todo: retrieve study/project info
	default:
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role specified"})

		return

	}
}

func (h *Handler) PostPeopleUpdate(ctx *gin.Context) {
	// todo
}
