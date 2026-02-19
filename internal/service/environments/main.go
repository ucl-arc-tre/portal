package environments

import (
	"time"

	"github.com/google/uuid"
	"github.com/hashicorp/golang-lru/v2/expirable"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

const (
	cacheSize = 10
	cacheTTL  = 1 * time.Hour
)

type Service struct {
	db    *gorm.DB
	cache *expirable.LRU[types.EnvironmentName, types.Environment]
}

func New() *Service {
	return &Service{
		db:    graceful.NewDB(),
		cache: expirable.NewLRU[types.EnvironmentName, types.Environment](cacheSize, nil, cacheTTL),
	}
}

func (s *Service) GetAll() ([]types.Environment, error) {
	var environments []types.Environment
	if err := s.db.Find(&environments).Error; err != nil {
		return nil, types.NewErrFromGorm(err)
	}

	return environments, nil
}

// Get the Id of the DSH environment. Cached
func (s *Service) DSHId() (uuid.UUID, error) {
	return s.environmentId(DSH)
}

func (s *Service) environmentId(name types.EnvironmentName) (uuid.UUID, error) {
	if environment, exists := s.cache.Get(name); exists {
		return environment.ID, nil
	}
	environment := types.Environment{Name: name}
	if err := s.db.First(&environment, "name = ?", name).Error; err != nil {
		return uuid.UUID{}, types.NewErrFromGorm(err)
	}
	_ = s.cache.Add(name, environment)
	return environment.ID, nil
}
