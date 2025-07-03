package users

import (
	"errors"
	"fmt"
	"time"

	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/service/users/certificate"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

func (s *Service) UpdateTraining(user types.User, data openapi.ProfileTrainingUpdate) (openapi.ProfileTrainingResponse, error) {
	if data.CertificateContentPdfBase64 == nil {
		log.Debug().Any("username", user.Username).Msg("Empty certificate content")
		return openapi.ProfileTrainingResponse{CertificateIsValid: ptr(false)}, nil
	}
	switch data.Kind {
	case openapi.TrainingKindNhsd:
		return s.updateNHSD(user, data)
	default:
		return openapi.ProfileTrainingResponse{}, fmt.Errorf("unsupported training kind [%v]", data.Kind)
	}
}

func (s *Service) updateNHSD(
	user types.User,
	data openapi.ProfileTrainingUpdate,
) (openapi.ProfileTrainingResponse, error) {
	certificate, err := certificate.ParseNHSDCertificate(*data.CertificateContentPdfBase64)
	response := openapi.ProfileTrainingResponse{
		CertificateIsValid: ptr(false),
	}
	if err != nil {
		response.CertificateMessage = ptr("Failed to parse certificate.")
		return response, err
	}
	if !certificate.HasIssuedAt() {
		response.CertificateMessage = ptr("Certificate was missing an issued at date.")
		return response, nil
	}
	if !NHSDTrainingIsValid(certificate.IssuedAt) {
		message := fmt.Sprintf("Certificate was issued more than %v years in the past.", config.TrainingValidityYears)
		response.CertificateMessage = ptr(message)
		return response, nil
	}
	chosenName, err := s.userChosenName(user)
	if err != nil || chosenName == "" {
		response.CertificateMessage = ptr("Failed to get user's chosen name, or it was unset.")
		return response, err
	}
	if !certificate.NameMatches(string(chosenName)) {
		response.CertificateMessage = ptr(fmt.Sprintf("Name '%v' does not match '%v'.", certificate.Name(), chosenName))
		return response, err
	}
	response.CertificateIsValid = &certificate.IsValid
	if certificate.IsValid {
		response.CertificateIssuedAt = ptr(certificate.IssuedAt.Format(config.TimeFormat))
		if err := s.CreateNHSDTrainingRecord(user, certificate.IssuedAt); err != nil {
			return response, err
		}
		if err := s.updateApprovedResearcherStatus(user); err != nil {
			return response, err
		}
	}
	return response, nil
}

func (s *Service) hasValidNHSDTrainingRecord(user types.User) (bool, error) {
	record := types.UserTrainingRecord{
		UserID: user.ID,
		Kind:   types.TrainingKindNHSD,
	}
	result := s.db.Order("completed_at desc").Where(&record).First(&record)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return false, nil
	} else if result.Error != nil {
		return false, result.Error
	}
	return NHSDTrainingIsValid(record.CompletedAt), nil
}

func (s *Service) CreateNHSDTrainingRecord(user types.User, completedAt time.Time) error {
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

// returns all training records for a user
func (s *Service) GetTrainingStatus(user types.User) (openapi.ProfileTrainingStatus, error) {
	var trainingRecords []openapi.TrainingRecord

	// Get NHSD training record with single DB query
	record := types.UserTrainingRecord{
		UserID: user.ID,
		Kind:   types.TrainingKindNHSD,
	}
	result := s.db.Order("completed_at desc").Where(&record).First(&record)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		// No NHSD training record found
		nhsdRecord := openapi.TrainingRecord{
			Kind:    openapi.TrainingKindNhsd,
			IsValid: false,
		}
		trainingRecords = append(trainingRecords, nhsdRecord)
	} else if result.Error != nil {
		// Database error
		return openapi.ProfileTrainingStatus{}, result.Error
	} else {
		// Record found - check if it's still valid
		completedAt := record.CompletedAt.Format(config.TimeFormat)

		nhsdRecord := openapi.TrainingRecord{
			Kind:        openapi.TrainingKindNhsd,
			IsValid:     NHSDTrainingIsValid(record.CompletedAt),
			CompletedAt: &completedAt,
		}
		trainingRecords = append(trainingRecords, nhsdRecord)
	}

	// TODO: Add other training types here in the future

	return openapi.ProfileTrainingStatus{
		TrainingRecords: trainingRecords,
	}, nil
}

func NHSDTrainingIsValid(completedAt time.Time) bool {
	return time.Since(completedAt) < config.TrainingValidity
}

func ptr[T any](value T) *T {
	return &value
}
