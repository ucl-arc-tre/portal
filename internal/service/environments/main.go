package environments

import (
	"github.com/ucl-arc-tre/portal/internal/graceful"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

type Service struct {
	db *gorm.DB
}

func New() *Service {
	return &Service{db: graceful.NewDB()}
}

func (s *Service) GetAll() ([]types.Environment, error) {
	var environments []types.Environment
	if err := s.db.Find(&environments).Error; err != nil {
		return nil, types.NewErrFromGorm(err)
	}

	return environments, nil
}
