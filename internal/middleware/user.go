package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/ucl-arc-tre/portal/internal/types"
)

const (
	usernameHeaderKey = "X-Forwarded-Preferred-Username"
)

func SetUser(ctx *gin.Context) {
	username := ctx.GetHeader(usernameHeaderKey)
	if username == "" {
		panic("username header unset")
	}
	ctx.Set("user", types.User{Username: username})
}

func GetUser(ctx *gin.Context) types.User {
	return ctx.MustGet("user").(types.User)
}
