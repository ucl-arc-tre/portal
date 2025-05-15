package profile

import (
	"time"

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
	conformation := types.UserAgreementConfirmation{
		UserID:      user.ID,
		AgreementID: agreementId,
	}
	result := s.db.Where(&conformation).Assign(types.Agreement{
		Model: types.Model{CreatedAt: time.Now()},
	}).FirstOrCreate(&conformation)
	return result.Error
}
