package users

import (
	"github.com/ucl-arc-tre/portal/internal/graceful"
	"gorm.io/gorm"
)

type Service struct {
	db *gorm.DB
}

func New() *Service {
	return &Service{db: graceful.NewDB()}
}
