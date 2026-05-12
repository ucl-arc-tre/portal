package agreements

import (
	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

const (
	ApprovedResearcherType = types.AgreementType("approved-researcher")
	StudyOwnerType         = types.AgreementType("study-owner")
	StudyAdministratorType = types.AgreementType("study-administrator")
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

func (s *Service) LatestStudyAdministrator() (*types.Agreement, error) {
	return s.latestAgreement(StudyAdministratorType)
}

func (s *Service) AgreementTypeById(id uuid.UUID) (*types.AgreementType, error) {
	agreement := types.Agreement{}
	result := s.db.Select("type").Where("id = ?", id).First(&agreement)
	if result.Error != nil {
		return nil, types.NewErrFromGorm(result.Error)
	}
	return &agreement.Type, nil
}

func (s *Service) latestAgreement(agreementType types.AgreementType) (*types.Agreement, error) {
	agreemeent := types.Agreement{}
	result := s.db.Where("type = ?", agreementType).
		Order("created_at desc").
		Limit(1).
		First(&agreemeent)
	return &agreemeent, types.NewErrFromGorm(result.Error, "failed to get latest agreement")
}
