package users

import (
	"github.com/ucl-arc-tre/portal/internal/controller/entra"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

type Service struct {
	db    *gorm.DB
	entra *entra.Controller
}

func New() *Service {
	service := Service{
		db:    graceful.NewDB(),
		entra: entra.New(),
	}
	return &service
}

func (s *Service) Total() (int, error) {
	var count int64
	err := s.db.Model(&types.User{}).Count(&count).Error
	return int(count), types.NewErrFromGorm(err, "failed to count users")
}
