package middleware

import (
	"github.com/gin-contrib/secure"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
)

// Create secure middleware. Disabled in dev/testing
func NewSecure() gin.HandlerFunc {
	if config.IsTesting() || config.IsDevDeploy() {
		log.Warn().Msg("Secure middleware disabled in development + testing")
		return func(c *gin.Context) {}
	}
	return secure.New(secure.Config{
		IsDevelopment:         false,
		SSLRedirect:           true,
		STSSeconds:            315360000,
		STSIncludeSubdomains:  true,
		FrameDeny:             false, // no longer recommended or widely supported
		ContentTypeNosniff:    true,
		BrowserXssFilter:      false, // no longer recommended or widely supported
		ContentSecurityPolicy: "default-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
		IENoOpen:              true,
		SSLProxyHeaders:       map[string]string{"X-Forwarded-Proto": "https"},
		ReferrerPolicy:        "strict-origin-when-cross-origin",
	})
}
