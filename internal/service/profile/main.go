package profile

import (
	"github.com/google/uuid"
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

func (s *Service) ConfirmAgreement(user types.User, agreementId uuid.UUID) error {
	result := s.db.Create(&types.UserAgreementConformation{
		UserID:      user.ID,
		AgreementID: agreementId,
	})
	return result.Error
}
