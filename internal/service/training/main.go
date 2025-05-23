package training

import (
	"fmt"
	"time"

	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/service/training/pdf"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

type Service struct {
	db *gorm.DB
}

func New() *Service {
	return &Service{db: graceful.NewDB()}
}

func (s *Service) Update(user types.User, data openapi.ProfileTrainingUpdate) (openapi.ProfileTrainingResponse, error) {
	if data.CertficateContentPdfBase64 == nil {
		log.Debug().Any("username", user.Username).Msg("Empty certificate content")
		return openapi.ProfileTrainingResponse{CertificateIsValid: ptr(false)}, nil
	}
	switch data.Kind {
	case openapi.TrainingKindNhsd:
		return s.updateNHSD(user, data)
	}
	return openapi.ProfileTrainingResponse{}, fmt.Errorf("unsupported training kind")
}

func (s *Service) updateNHSD(
	user types.User,
	data openapi.ProfileTrainingUpdate,
) (openapi.ProfileTrainingResponse, error) {
	certificate, err := pdf.ParseNHSDCertificate(*data.CertficateContentPdfBase64)
	response := openapi.ProfileTrainingResponse{
		CertificateIsValid: ptr(false),
	}
	if err != nil {
		response.CertificateMessage = ptr("Failed to parse certificate")
		return response, err
	}
	response.CertificateIsValid = &certificate.IsValid
	if certificate.IsValid { // todo: check name matches
		if err := s.createTrainingRecord(user, types.TrainingKindNHSD); err != nil {
			return response, err
		}
	}
	return response, nil
}

func (s *Service) createTrainingRecord(user types.User, kind types.TrainingKind) error {
	record := types.UserTrainingRecord{
		UserID: user.ID,
		Kind:   kind,
	}
	result := s.db.Where(&record).Assign(types.UserTrainingRecord{
		Model: types.Model{CreatedAt: time.Now()},
	}).FirstOrCreate(&record)
	return result.Error
}

func ptr[T any](value T) *T {
	return &value
}
