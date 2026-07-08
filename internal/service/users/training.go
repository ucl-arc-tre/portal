package users

import (
	"fmt"
	"time"

	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/service/users/certificate"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func (s *Service) UpdateTraining(user types.User, data openapi.ProfileTrainingUpdate) (openapi.ProfileTrainingResponse, error) {
	if data.CertificateContentPdfBase64 == nil {
		log.Debug().Any("username", user.Username).Msg("Empty certificate content")
		return openapi.ProfileTrainingResponse{CertificateIsValid: new(false)}, nil
	}
	kind, err := certificate.Kind(*data.CertificateContentPdfBase64)
	if err != nil {
		log.Debug().Any("username", user.Username).Msg("Failed to parse training kind for user")
		return openapi.ProfileTrainingResponse{
			CertificateIsValid: new(false),
			CertificateMessage: new("Failed to parse training kind."),
		}, nil
	}

	cert, err := certificate.Parse(kind, *data.CertificateContentPdfBase64)
	response := openapi.ProfileTrainingResponse{
		CertificateIsValid: new(false),
	}
	if err != nil {
		return response, err
	}
	if !cert.HasIssuedAt() {
		response.CertificateMessage = new("Certificate was missing an issued at date.")
		return response, nil
	}
	if !TrainingIsValid(cert.IssuedAt) {
		message := fmt.Sprintf("Certificate was issued more than %v years in the past.", config.TrainingValidityYears)
		response.CertificateMessage = new(message)
		return response, nil
	}
	chosenName, err := s.userChosenName(user)
	if err != nil || chosenName == "" {
		response.CertificateMessage = new("Failed to get user's chosen name, or it was unset.")
		return response, err
	}
	if !cert.NameMatches(string(chosenName)) {
		response.CertificateMessage = new(fmt.Sprintf("Name '%v' does not match '%v'.", cert.Name, chosenName))
		return response, nil
	}
	response.CertificateIsValid = &cert.IsValid
	if cert.IsValid {
		response.CertificateIssuedAt = new(cert.IssuedAt.Format(config.TimeFormat))
		if err := s.CreateTrainingRecord(user, types.TrainingKind(kind), cert.IssuedAt); err != nil {
			return response, err
		}
	}
	return response, nil
}

func (s *Service) hasValidApprovedResearcherTrainingRecord(user types.User) (bool, error) {
	record := types.UserTrainingRecord{UserID: user.ID}
	result := s.db.Order("completed_at desc").
		Where("user_id = ? AND (kind = ? OR kind = ?)", user.ID, types.TrainingKindNHSD, types.TrainingKindUCLHIg).
		Find(&record)
	if result.RowsAffected == 0 {
		return false, nil
	} else if result.Error != nil {
		return false, types.NewErrFromGorm(result.Error)
	}
	return TrainingIsValid(record.CompletedAt), nil
}

// Create a NHSD training record for a user and update the approved researcher status if required
func (s *Service) CreateTrainingRecord(user types.User, kind types.TrainingKind, completedAt time.Time) error {
	record := types.UserTrainingRecord{
		UserID: user.ID,
		Kind:   kind,
	}
	result := s.db.Where(&record).Assign(types.UserTrainingRecord{
		Model:       types.Model{CreatedAt: time.Now()},
		CompletedAt: completedAt,
	}).FirstOrCreate(&record)
	if result.Error != nil {
		return types.NewErrFromGorm(result.Error)
	}
	return s.updateApprovedResearcherStatus(user)
}

// returns all training records for a user
func (s *Service) TrainingRecords(user types.User) ([]openapi.TrainingRecord, error) {
	trainingRecords := []openapi.TrainingRecord{}

	records := []types.UserTrainingRecord{}
	err := s.db.Order("completed_at desc").Where("user_id = ?", user.ID).Find(&records).Error
	if err != nil {
		return trainingRecords, types.NewErrFromGorm(err)
	}

	for _, record := range records {
		trainingRecord := openapi.TrainingRecord{
			CompletedAt: new(record.CompletedAt.Format(config.TimeFormat)),
			IsValid:     TrainingIsValid(record.CompletedAt),
		}
		switch record.Kind {
		case types.TrainingKindNHSD:
			trainingRecord.Kind = openapi.TrainingKindNhsd
			trainingRecord.IsIgKind = new(true)
		case types.TrainingKindUCLHIg:
			trainingRecord.Kind = openapi.TrainingKindUclhIg
			trainingRecord.IsIgKind = new(true)
		default:
			log.Error().Any("kind", record.Kind).Msg("Invalid training kind")
		}
		trainingRecords = append(trainingRecords, trainingRecord)
	}
	return trainingRecords, nil
}

// Get the time at which a users NHSD training expires. Optional
func (s *Service) TrainingExpiresAt(user types.User, kind types.TrainingKind) (*time.Time, error) {
	record := types.UserTrainingRecord{
		UserID: user.ID,
		Kind:   kind,
	}
	result := s.db.Order("completed_at desc").Where(&record).Find(&record)
	if result.RowsAffected == 0 {
		return nil, types.NewNotFoundError("")
	} else if result.Error != nil {
		return nil, types.NewErrFromGorm(result.Error)
	}
	expiresAt := record.CompletedAt.Add(config.TrainingValidity)
	return &expiresAt, nil
}

func trainingRecordsIncludeValidIg(records []openapi.TrainingRecord) bool {
	for _, record := range records {
		if record.IsValid && record.IsIgKind != nil && *record.IsIgKind {
			return true
		}
	}
	return false
}

func TrainingIsValid(completedAt time.Time) bool {
	return time.Since(completedAt) < config.TrainingValidity
}
