package middleware

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/service/tokens"
)

func NewJWT() func(*gin.Context) {
	tokens := tokens.New()
	return func(ctx *gin.Context) {
		rawToken, err := extractTokenFromHeader(ctx.GetHeader("Authorization"))
		if err != nil {
			log.Warn().Err(err).Msg("Incorrectly formatted auth header")
			ctx.AbortWithStatus(http.StatusNotAcceptable)
			return
		}
		claims, err := tokens.ParseClaims(rawToken)
		if err != nil {
			log.Warn().Err(err).Msg("Failed to validate token")
			ctx.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		requiredScopes := ctx.MustGet("JWT.Scopes").([]string) // Set by openapi
		if !claims.HasAll(requiredScopes) {
			ctx.AbortWithStatus(http.StatusUnauthorized)
			log.Warn().Any("scopes", claims.Scopes).Msg("Missing required scopes")
			return
		}
	}
}

func extractTokenFromHeader(authHeader string) (string, error) {
	if authHeader == "" {
		return "", errors.New("request missing auth header")
	}
	authHeaderParts := strings.Split(authHeader, " ")
	if len(authHeaderParts) != 2 {
		return "", errors.New("incorrect number of parts in auth header")
	}
	if authHeaderParts[0] != "Bearer" || authHeaderParts[1] == "" {
		return "", errors.New("invalid auth header")
	}
	return authHeaderParts[1], nil
}
