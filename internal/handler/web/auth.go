package web

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/rbac"
)

func (h *Handler) GetAuth(ctx *gin.Context) {
	user := middleware.GetUser(ctx)
	auth := openapi.Auth{Username: string(user.Username)}
	roles, err := rbac.GetRoles(user)
	if err != nil {
		setError(ctx, err, "Failed to get roles for user")
		return
	}
	for _, role := range roles {
		auth.Roles = append(auth.Roles, openapi.AuthRoles(role))
	}
	ctx.JSON(http.StatusOK, auth)
}
