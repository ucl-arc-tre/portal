package web

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
)

func (h *Handler) GetAuth(ctx *gin.Context) {
	user := middleware.GetUser(ctx)

	authInfo, err := h.auth.AuthInfo(ctx, user)
	if err != nil {
		setError(ctx, err, "Failed to get auth info")
		return
	}

	auth := openapi.Auth{
		Username: string(user.Username),
		IsStaff:  authInfo.IsStaff,
	}

	for _, role := range authInfo.Roles {
		auth.Roles = append(auth.Roles, openapi.AuthRoles(role))
	}

	ctx.JSON(http.StatusOK, auth)
}
