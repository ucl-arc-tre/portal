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
	return s.latestAgreement(ApprovedResearcherType)
}

func (s *Service) LatestStudyOwner() (*types.Agreement, error) {
	return s.latestAgreement(StudyOwnerType)
}

func (s *Service) latestAgreement(agreementType types.AgreementType) (*types.Agreement, error) {
	agreemeent := types.Agreement{}
	result := s.db.Where("type = ?", agreementType).
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
