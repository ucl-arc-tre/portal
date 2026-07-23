package users

import (
	"time"

	"github.com/hashicorp/golang-lru/v2/expirable"
	"github.com/ucl-arc-tre/portal/internal/controller/entra"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/service/notifications"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

const roleCacheTTL = 24 * time.Hour // only deploy time roles, so can have a long TTL

type Service struct {
	db            *gorm.DB
	entra         entra.Interface
	notifications notifications.Interface
	roleCache     *expirable.LRU[rbac.ConfigRolename, []types.User]
}

func New() *Service {
	service := Service{
		db:            graceful.NewDB(),
		entra:         entra.New(),
		notifications: notifications.New(),
		roleCache:     expirable.NewLRU[rbac.RoleName, []types.User](100, nil, roleCacheTTL),
	}
	return &service
}
