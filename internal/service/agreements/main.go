package agreements

import (
	"github.com/ucl-arc-tre/portal/internal/graceful"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

const (
	ApprovedResearcherType = types.AgreementType(openapi.AgreementTypeApprovedResearcher)
	StudyOwnerType         = types.AgreementType(openapi.AgreementTypeStudyOwner)
)

type Service struct {
	db *gorm.DB
}

func New() *Service {
	return &Service{db: graceful.NewDB()}
}

func (s *Service) LatestApprovedResearcher() (*types.Agreement, error) {
	agreemeent := types.Agreement{}
	result := s.db.Where("type = ?", ApprovedResearcherType).
		Order("created_at desc").
		Limit(1).
		Find(&agreemeent)
	if result.Error != nil {
		return nil, types.NewErrServerError(result.Error)
	}
	if result.RowsAffected == 0 {
		return nil, types.NewNotFoundError("no agreements")
	}
	return &agreemeent, nil
}

func (s *Service) StudyOwnerAgreementText() (*types.Agreement, error) {
	agreemeent := types.Agreement{}
	result := s.db.Where("type = ?", StudyOwnerType).
		Order("created_at desc").
		Limit(1).
		Find(&agreemeent)
	if result.Error != nil {
		return nil, types.NewErrServerError(result.Error)
	}
	if result.RowsAffected == 0 {
		return nil, types.NewNotFoundError("no agreements")
	}
	return &agreemeent, nil
}
