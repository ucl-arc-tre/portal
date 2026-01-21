package middleware

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-chi/httprate"
	"github.com/ucl-arc-tre/portal/internal/config"
)

func NewWebRateLimit() gin.HandlerFunc {
	defaultLimiter := httprate.NewRateLimiter(100, time.Minute)
	slowLimiter := httprate.NewRateLimiter(5, time.Minute)
	slowPaths := config.RateLimitSlowPaths()

	handlerFunc := func(ctx *gin.Context) {
		onLimit := defaultLimiter.OnLimit
		if isSlow, exists := slowPaths[ctx.FullPath()]; exists && isSlow {
			onLimit = slowLimiter.OnLimit
		}

		key := ctx.GetHeader(usernameHeaderKey)
		if onLimit(ctx.Writer, ctx.Request, key) {
			ctx.AbortWithStatus(http.StatusTooManyRequests)
			return
		}
		ctx.Next()
	}

	return handlerFunc
}
