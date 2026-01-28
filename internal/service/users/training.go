package users

import (
	"fmt"
	"time"

	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/service/agreements"
	"github.com/ucl-arc-tre/portal/internal/service/users/certificate"
	"github.com/ucl-arc-tre/portal/internal/types"
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
		err := fmt.Errorf("unsupported training kind [%v]", data.Kind)
		return openapi.ProfileTrainingResponse{}, types.NewErrInvalidObject(err)
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
		response.CertificateMessage = ptr(fmt.Sprintf("Name '%v' does not match '%v'.", certificate.Name, chosenName))
		return response, err
	}
	response.CertificateIsValid = &certificate.IsValid
	if certificate.IsValid {
		response.CertificateIssuedAt = ptr(certificate.IssuedAt.Format(config.TimeFormat))
		if err := s.CreateNHSDTrainingRecord(user, certificate.IssuedAt); err != nil {
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
	result := s.db.Order("completed_at desc").Where(&record).Find(&record)
	if result.RowsAffected == 0 {
		return false, nil
	} else if result.Error != nil {
		return false, types.NewErrFromGorm(result.Error)
	}
	return NHSDTrainingIsValid(record.CompletedAt), nil
}

// Create a NHSD training record for a user and update the approved researcher status if required
func (s *Service) CreateNHSDTrainingRecord(user types.User, completedAt time.Time) error {
	record := types.UserTrainingRecord{
		UserID: user.ID,
		Kind:   types.TrainingKindNHSD,
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
		switch record.Kind {
		case types.TrainingKindNHSD:
			completedAt := record.CompletedAt.Format(config.TimeFormat)
			trainingRecords = append(trainingRecords, openapi.TrainingRecord{
				Kind:        openapi.TrainingKindNhsd,
				CompletedAt: &completedAt,
				IsValid:     NHSDTrainingIsValid(record.CompletedAt),
			})
		default:
			panic("unsupported training type")
		}
	}
	return trainingRecords, nil
}

// Get the time at which a users NHSD training expires. Optional
func (s *Service) NHSDTrainingExpiresAt(user types.User) (*time.Time, error) {
	record := types.UserTrainingRecord{
		UserID: user.ID,
		Kind:   types.TrainingKindNHSD,
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

func (s *Service) NumApprovedResearchersValidTraining() (int, error) {
	var count int64
	result := s.db.Model(&types.User{}).
		Joins("INNER JOIN user_agreement_confirmations ON users.id = user_id").
		Joins("INNER JOIN agreements ON user_agreement_confirmations.agreement_id = agreements.id").
		Joins("INNER JOIN user_training_records ON users.id = user_training_records.user_id").
		Where("agreements.type = ? AND user_training_records.kind = ? AND user_training_records.completed_at > now() - interval '1 year'", agreements.ApprovedResearcherType, types.TrainingKindNHSD).
		Count(&count)
	return int(count), types.NewErrFromGorm(result.Error, "failed to count valid users")
}

func (s *Service) NumApprovedResearchersExpiredTraining() (int, error) {
	var count int64
	result := s.db.Model(&types.User{}).
		Joins("INNER JOIN user_agreement_confirmations ON users.id = user_id").
		Joins("INNER JOIN agreements ON user_agreement_confirmations.agreement_id = agreements.id").
		Joins("INNER JOIN user_training_records ON users.id = user_training_records.user_id").
		Where("agreements.type = ? AND user_training_records.kind = ? AND user_training_records.completed_at < now() - interval '1 year'", agreements.ApprovedResearcherType, types.TrainingKindNHSD).
		Count(&count)
	return int(count), types.NewErrFromGorm(result.Error, "failed to count expired users")
}

func NHSDTrainingIsValid(completedAt time.Time) bool {
	return time.Since(completedAt) < config.TrainingValidity
}

func ptr[T any](value T) *T {
	return &value
}
