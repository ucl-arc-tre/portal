package users

import (
	"time"

	"github.com/ucl-arc-tre/portal/internal/controller/entra"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	"gorm.io/gorm"
)

type Service struct {
	db    *gorm.DB
	entra *entra.Controller
}

func New() *Service {
	service := Service{
		db:    graceful.NewDB(),
		entra: entra.New(1 * time.Hour),
	}
	return &service
}
