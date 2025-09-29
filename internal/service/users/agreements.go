package users

import (
	"time"

	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/config"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func (s *Service) ConfirmAgreement(user types.User, agreementId uuid.UUID) error {
	confirmation := types.UserAgreementConfirmation{
		UserID:      user.ID,
		AgreementID: agreementId,
	}
	result := s.db.Where(&confirmation).Assign(types.Agreement{
		Model: types.Model{CreatedAt: time.Now()},
	}).FirstOrCreate(&confirmation)
	if result.Error != nil {
		return types.NewErrFromGorm(result.Error)
	}
	return s.updateApprovedResearcherStatus(user)
}

func (s *Service) ConfirmedAgreements(user types.User) ([]openapi.ConfirmedAgreement, error) {
	data := []struct {
		Type      string
		CreatedAt time.Time
	}{}
	result := s.db.Select("agreements.type", "user_agreement_confirmations.created_at").
		Table("user_agreement_confirmations").
		Joins("left join agreements on agreements.id = user_agreement_confirmations.agreement_id").
		Where(types.UserAgreementConfirmation{UserID: user.ID}).
		Scan(&data)
	if result.Error != nil {
		return []openapi.ConfirmedAgreement{}, types.NewErrFromGorm(result.Error)
	}

	agreements := []openapi.ConfirmedAgreement{}
	for _, item := range data {
		agreements = append(agreements, openapi.ConfirmedAgreement{
			AgreementType: openapi.AgreementType(item.Type),
			ConfirmedAt:   item.CreatedAt.Format(config.TimeFormat),
		})
	}
	return agreements, nil
}

func (s *Service) hasAgreedToApprovedResarcherAgreement(user types.User) (bool, error) {
	agreements, err := s.ConfirmedAgreements(user)
	if err != nil {
		return false, err
	}
	for _, agreement := range agreements {
		if agreement.AgreementType == openapi.AgreementTypeApprovedResearcher {
			return true, nil
		}
	}
	return false, nil
}
