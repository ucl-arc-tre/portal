package middleware

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/hashicorp/golang-lru/v2/expirable"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

const (
	userCacheTTL      = 1 * time.Hour
	userContextKey    = "user"
	usernameHeaderKey = "X-Forwarded-Preferred-Username" // See: https://oauth2-proxy.github.io/oauth2-proxy/configuration/overview
)

// Get the user from the gin context
func GetUser(ctx *gin.Context) types.User {
	return ctx.MustGet(userContextKey).(types.User)
}

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

func (u *UserSetter) setUser(ctx *gin.Context) {
	username := types.Username(ctx.GetHeader(usernameHeaderKey))
	if username == "" {
		panic("username header unset")
	}
	if user, existsInCache := u.cache.Get(username); existsInCache {
		ctx.Set(userContextKey, user)
		return
	}
	user, err := u.persistedUser(username)
	if err != nil {
		log.Err(err).Msg("Failed to get user")
		ctx.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	ctx.Set(userContextKey, user)
}

// Get a user that's persisted in the database by their username. If
// they do not exist then they will be created with the base role
func (u *UserSetter) persistedUser(username types.Username) (types.User, error) {
	user := types.User{}
	result := u.db.Where("username = ?", username).
		Attrs(types.User{
			Username: username,
			Model:    types.Model{CreatedAt: time.Now()},
		}).
		FirstOrCreate(&user)
	if result.Error != nil {
		return user, result.Error
	}
	userWasCreated := result.RowsAffected > 0
	if userWasCreated {
		_, err := rbac.AddRole(user, rbac.Base)
		if err != nil {
			return user, fmt.Errorf("failed assign user base role: %v", err)
		}
	}
	return user, nil
}
