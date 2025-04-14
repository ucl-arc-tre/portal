package middleware

import (
	"github.com/gin-contrib/secure"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
)

// Create secure middleware. Disabled in dev/testing
func NewSecure() gin.HandlerFunc {
	isDevelopment := config.IsDevDeploy() || config.IsTesting()
	if isDevelopment {
		log.Warn().Msg("Secure middleware disabled in development + testing")
	}
	return secure.New(secure.Config{
		IsDevelopment:         isDevelopment,
		SSLRedirect:           true,
		STSSeconds:            315360000,
		STSIncludeSubdomains:  true,
		FrameDeny:             true,
		ContentTypeNosniff:    true,
		BrowserXssFilter:      true,
		ContentSecurityPolicy: "default-src 'self'",
		IENoOpen:              true,
		SSLProxyHeaders:       map[string]string{"X-Forwarded-Proto": "https"},
	})
}
