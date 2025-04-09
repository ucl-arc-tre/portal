package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/ucl-arc-tre/portal/internal/types"
)

const (
	usernameHeaderKey = "X-Forwarded-Preferred-Username" // See: https://oauth2-proxy.github.io/oauth2-proxy/configuration/overview
)

// Get the user for a request
func SetUser(ctx *gin.Context) {
	username := ctx.GetHeader(usernameHeaderKey)
	if username == "" {
		panic("username header unset")
	}
	ctx.Set("user", types.User{Username: username})
}

// Get the user from the gin context
func GetUser(ctx *gin.Context) types.User {
	return ctx.MustGet("user").(types.User)
}
