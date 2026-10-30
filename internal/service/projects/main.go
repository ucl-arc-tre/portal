package projects

import (
	"github.com/ucl-arc-tre/portal/internal/controller/entra"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	"github.com/ucl-arc-tre/portal/internal/service/environments"
	"github.com/ucl-arc-tre/portal/internal/service/notifications"
	"github.com/ucl-arc-tre/portal/internal/service/users"
	"gorm.io/gorm"
)

const (
	maxUnixUsernameLength = 10
)

type Service struct {
	db            *gorm.DB
	entra         *entra.Controller
	users         users.Interface
	environments  *environments.Service
	notifications notifications.Interface
}

func New() *Service {
	return &Service{
		db:            graceful.NewDB(),
		entra:         entra.New(),
		users:         users.New(),
		environments:  environments.New(),
		notifications: notifications.New(),
	}
}
