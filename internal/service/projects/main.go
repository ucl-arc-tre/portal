package projects

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

func (s *Service) ValidateProjectRequest() error {
	// TODO: For each member in request:
	//   - Validate their complete set of roles together
	//   - Check portal-level prerequisites (approved researcher, etc.)
	//   - Check TRE role dependencies (ordering matters)
	return nil
}
