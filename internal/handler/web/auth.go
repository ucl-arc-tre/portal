package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/rbac"
)

func (h *Handler) GetAuth(ctx *gin.Context) {
	user := middleware.GetUser(ctx)
	roles, err := rbac.GetRoles(user)
	if err != nil {
		setServerError(ctx, err, "Failed to get roles for user")
		return
	}
	ctx.JSON(http.StatusOK, openapi.Auth{
		Username: string(user.Username),
		Roles:    roles,
	})
}
