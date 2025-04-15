package agreements

import (
	"fmt"

	"github.com/ucl-arc-tre/portal/internal/graceful"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

const (
	ApprovedResearcherType = types.AgreementType("approved-researcher")
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
	if result.Error != nil || len(agreemeents) == 0 {
		return nil, fmt.Errorf("failed to get agreement %v", result.Error)
	}
	return &agreemeents[0], nil
}
