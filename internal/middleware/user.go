package middleware

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/hashicorp/golang-lru/v2/expirable"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

const (
	userCacheTTL      = 1 * time.Minute
	userContextKey    = "user"
	usernameHeaderKey = "X-Forwarded-Preferred-Username" // See: https://oauth2-proxy.github.io/oauth2-proxy/configuration/overview
)

type UserSetter struct {
	db    *gorm.DB
	cache *expirable.LRU[types.Username, types.User]
}

func NewSetUser() gin.HandlerFunc {
	setter := &UserSetter{
		db:    graceful.NewDB(),
		cache: expirable.NewLRU[types.Username, types.User](1000, nil, userCacheTTL),
	}
	return setter.setUser
}

// Set the user for a request
func (u *UserSetter) setUser(ctx *gin.Context) {
	username := types.Username(ctx.GetHeader(usernameHeaderKey))
	if username == "" {
		panic("username header unset")
	}
	user, existsInCache := u.cache.Get(username)
	if !existsInCache {
		result := u.db.Where("username = ?", username).FirstOrInit(&user)
		log.Debug().Any("result", result).Msg("todo - rm")
		if result.Error != nil {
			log.Err(result.Error).Msg("Failed to set user")
			ctx.AbortWithStatus(http.StatusInternalServerError)
			return
		} else {
			_ = u.cache.Add(username, user)
		}
	}
	ctx.Set(userContextKey, user)
}

// Get the user from the gin context
func GetUser(ctx *gin.Context) types.User {
	return ctx.MustGet(userContextKey).(types.User)
}
