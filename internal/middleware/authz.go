package middleware

import (
	"net/http"
	"strings"

	"github.com/casbin/casbin/v2"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/rbac"
)

type Authorizer struct {
	enforcer *casbin.Enforcer
}

// New authorization middleware. Assumes user has been set
func NewAuthz() gin.HandlerFunc {
	authorizer := &Authorizer{rbac.NewCasbinEnforcer()}
	return authorizer.eval
}

func (a *Authorizer) eval(ctx *gin.Context) {
	if isAuthorized, err := a.isAuthorized(ctx); err != nil {
		log.Err(err).Msg("Failed to check authorization")
		ctx.AbortWithStatus(http.StatusInternalServerError)
	} else if !isAuthorized {
		ctx.AbortWithStatus(http.StatusForbidden)
	}
}

func (a *Authorizer) isAuthorized(ctx *gin.Context) (bool, error) {
	userId := GetUser(ctx).ID.String()
	resource := trimBaseURL(ctx.Request.URL.Path)
	method := "write"
	if ctx.Request.Method == "GET" || ctx.Request.Method == "HEAD" {
		method = "read"
	}
	//roles, _ := a.enforcer.GetRolesForUser(userId)
	//log.Debug().Any("roles", roles).Any("resource", resource).Any("userId", userId).Any("method", method).Msg("authz")
	return a.enforcer.Enforce(userId, resource, method)
}

func trimBaseURL(url string) string {
	return strings.TrimPrefix(url, config.BaseURL)
}
