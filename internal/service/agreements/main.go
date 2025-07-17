package agreements

import (
	"fmt"

	"github.com/ucl-arc-tre/portal/internal/graceful"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

const (
	ApprovedResearcherType = types.AgreementType(openapi.AgreementTypeApprovedResearcher)
)

type Service struct {
	db *gorm.DB
}

func New() *Service {
	return &Service{db: graceful.NewDB()}
}

func (s *Service) LatestApprovedResearcher() (*types.Agreement, error) {
	agreemeents := []types.Agreement{}
	result := s.db.Where("type = ?", ApprovedResearcherType).
		Order("created_at desc").
		Limit(1).
		Find(&agreemeents)
	if result.Error != nil {
		return nil, types.NewErrServerError(result.Error)
	}
	if len(agreemeents) == 0 {
		return nil, types.NewErrServerError(fmt.Errorf("no agreements"))
	}
	return &agreemeents[0], nil
}
