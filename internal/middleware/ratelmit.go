package middleware

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-chi/httprate"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
)

func NewWebRateLimit() gin.HandlerFunc {
	defaultLimiter := httprate.NewRateLimiter(300, time.Minute)
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

func NewDSHRateLimit() func(ctx *gin.Context) {
	limiter := httprate.NewRateLimiter(100, time.Minute)

	handlerFunc := func(ctx *gin.Context) {
		// This keys by the real IP. The application should always be
		// deployed behind a reverse proxy that sets the headers and
		// are, as so, not trivially spoofable
		key, err := httprate.KeyByRealIP(ctx.Request)
		if err != nil {
			log.Err(err).Msg("Failed to get real IP")
			ctx.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		if limiter.OnLimit(ctx.Writer, ctx.Request, key) {
			ctx.AbortWithStatus(http.StatusTooManyRequests)
			return
		}
		ctx.Next()
	}

	return handlerFunc
}
