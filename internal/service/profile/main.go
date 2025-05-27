package profile

import (
	"errors"
	"regexp"
	"time"

	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

type Service struct {
	db *gorm.DB
}

func New() *Service {
	return &Service{db: graceful.NewDB()}
}

func (s *Service) ConfirmAgreement(user types.User, agreementId uuid.UUID) error {
	confirmation := types.UserAgreementConfirmation{
		UserID:      user.ID,
		AgreementID: agreementId,
	}
	result := s.db.Where(&confirmation).Assign(types.Agreement{
		Model: types.Model{CreatedAt: time.Now()},
	}).FirstOrCreate(&confirmation)
	return result.Error
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
	agreements := []openapi.ConfirmedAgreement{}
	for _, item := range data {
		agreements = append(agreements, openapi.ConfirmedAgreement{
			AgreementType: item.Type,
			ConfirmedAt:   item.CreatedAt.Format(config.TimeFormat),
		})
	}
	return agreements, result.Error
}

func (s *Service) Attributes(user types.User) (types.UserAttributes, error) {
	attrs := types.UserAttributes{}
	result := s.db.Take(&attrs).Where("user_id = ?", user.ID)
	return attrs, result.Error
}

func (s *Service) SetUserChosenName(user types.User, chosenName types.ChosenName) error {
	const isValidPattern = `^[A-Za-z\s\-\p{L}\p{M}]*$`
	isValidRegex := regexp.MustCompile(isValidPattern)

	if isValid := isValidRegex.MatchString(string(chosenName)); !isValid {
		return errors.New("invalid chosen name")
	}
	attrs := types.UserAttributes{UserID: user.ID}
	result := s.db.Where(&attrs).Assign(types.UserAttributes{
		Model:      types.Model{CreatedAt: time.Now()},
		ChosenName: chosenName,
	}).FirstOrCreate(&attrs)

	return result.Error
}
