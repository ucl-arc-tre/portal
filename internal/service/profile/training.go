package profile

import (
	"fmt"
	"time"

	"github.com/rs/zerolog/log"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/service/profile/certificate"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func (s *Service) UpdateTraining(user types.User, data openapi.ProfileTrainingUpdate) (openapi.ProfileTrainingResponse, error) {
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
	certificate, err := certificate.ParseNHSDCertificate(*data.CertficateContentPdfBase64)
	response := openapi.ProfileTrainingResponse{
		CertificateIsValid: ptr(false),
	}
	if err != nil {
		response.CertificateMessage = ptr("Failed to parse certificate")
		return response, err
	}
	if !certificate.HasIssuedAt() {
		return response, fmt.Errorf("certificate must have an issused at time to be saved")
	}
	chosenName, err := s.userChosenName(user)
	if err != nil || chosenName == "" {
		response.CertificateMessage = ptr("Failed to get users chosen name, or it was unset.")
		return response, err
	}
	if !certificate.NameMatches(chosenName) {
		response.CertificateMessage = ptr(fmt.Sprintf("Name '%v' does not match '%v'.", certificate.Name(), chosenName))
		return response, err
	}
	response.CertificateIsValid = &certificate.IsValid
	if certificate.IsValid { // todo: check name matches
		if err := s.createNHSDTrainingRecord(user, certificate.IssuedAt); err != nil {
			return response, err
		}
	}
	return response, nil
}

func (s *Service) createNHSDTrainingRecord(user types.User, completedAt time.Time) error {
	record := types.UserTrainingRecord{
		UserID: user.ID,
		Kind:   types.TrainingKindNHSD,
	}
	result := s.db.Where(&record).Assign(types.UserTrainingRecord{
		Model:       types.Model{CreatedAt: time.Now()},
		CompletedAt: completedAt,
	}).FirstOrCreate(&record)
	return result.Error
}

func ptr[T any](value T) *T {
	return &value
}
