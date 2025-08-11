package web

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/ucl-arc-tre/portal/internal/middleware"
)

func (h *Handler) GetAuth(ctx *gin.Context) {
	user := middleware.GetUser(ctx)

	info, err := h.auth.AuthInfo(ctx, user)
	if err != nil {
		setError(ctx, err, "Failed to get auth info")
		return
	}

	ctx.JSON(http.StatusOK, info)
}
