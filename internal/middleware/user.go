package middleware

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/hashicorp/golang-lru/v2/expirable"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/controller/entra"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/service/users"
	"github.com/ucl-arc-tre/portal/internal/types"
)

const (
	userCacheTTL      = 1 * time.Hour
	userContextKey    = "user"
	emailHeaderKey    = "X-Forwarded-Email"
	usernameHeaderKey = "X-Forwarded-Preferred-Username" // See: https://oauth2-proxy.github.io/oauth2-proxy/configuration/overview
)

// Get the user from the gin context
func GetUser(ctx *gin.Context) types.User {
	return ctx.MustGet(userContextKey).(types.User)
}

type UserSetter struct {
	users *users.Service
	cache *expirable.LRU[types.Username, types.User]
}

func NewSetUser() gin.HandlerFunc {
	setter := &UserSetter{
		users: users.New(),
		cache: expirable.NewLRU[types.Username, types.User](1000, nil, userCacheTTL),
	}
	return setter.setUser
}

func (u *UserSetter) setUser(ctx *gin.Context) {
	username := types.Username(ctx.GetHeader(usernameHeaderKey))
	if username == "" {
		panic("username header unset")
	}
	if user, existsInCache := u.cache.Get(username); existsInCache {
		ctx.Set(userContextKey, user)
		return
	}
	var user types.User
	var err error
	if entra.IsExternalUsername(username) {
		user, err = u.users.PersistedExternalUser(username, ctx.GetHeader(emailHeaderKey))
	} else {
		user, err = u.users.PersistedUser(username)
	}
	if err != nil {
		log.Err(err).Msg("Failed to get user")
		ctx.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	if hasBaseRole, err := rbac.HasRole(user, rbac.Base); err == nil && !hasBaseRole {
		_, _ = rbac.AddRole(user, rbac.Base)
	}
	if err := u.setDynamicRoles(ctx, user); err != nil {
		log.Err(err).Msg("Failed to set dynamic roles")
	}
	ctx.Set(userContextKey, user)
}

func (u *UserSetter) setDynamicRoles(ctx *gin.Context, user types.User) error {
	isStaff, err := u.users.IsStaff(ctx, user)
	if err != nil {
		return err
	}
	if isStaff {
		_, err = rbac.AddRole(user, rbac.Staff)
	} else {
		_, err = rbac.RemoveRole(user, rbac.Staff)
	}
	if err != nil {
		return err
	}
	isApprovedResearcher, err := rbac.HasRole(user, rbac.ApprovedResearcher)
	if err != nil {
		return err
	}
	if isStaff && isApprovedResearcher {
		_, err = rbac.AddRole(user, rbac.ApprovedStaffResearcher)
	} else {
		// If the user is not longer staff the role should be removed
		_, err = rbac.RemoveRole(user, rbac.ApprovedStaffResearcher)
	}
	return err
}
