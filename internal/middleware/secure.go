package middleware

import (
	"github.com/gin-contrib/secure"
	"github.com/gin-gonic/gin"
	"github.com/ucl-arc-tre/portal/internal/config"
)

func NewSecure() gin.HandlerFunc {
	return secure.New(secure.Config{
		IsDevelopment:         config.IsDevDeploy(),
		SSLRedirect:           true,
		STSSeconds:            315360000,
		STSIncludeSubdomains:  true,
		FrameDeny:             true,
		ContentTypeNosniff:    true,
		BrowserXssFilter:      true,
		ContentSecurityPolicy: "default-src 'none'",
		IENoOpen:              true,
		SSLProxyHeaders:       map[string]string{"X-Forwarded-Proto": "https"},
	})
}
