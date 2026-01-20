package studies

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/controller/s3"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
	"github.com/ucl-arc-tre/portal/internal/validation"
)

func (s *Service) ValidateContractMetadata(contractData openapi.ContractUploadObject, filename string) *openapi.ValidationError {
	// Only validate file extension if a filename is provided (for an updated contract, file is optional)
	if filename != "" && !strings.HasSuffix(strings.ToLower(filename), ".pdf") {
		return &openapi.ValidationError{
			ErrorMessage: "Only PDF files are allowed",
		}
	}

	if !validation.ContractNamePattern.MatchString(contractData.OrganisationSignatory) {
		return &openapi.ValidationError{
			ErrorMessage: "Organisation signatory must be between 2 and 100 characters",
		}
	}

	if !validation.ContractNamePattern.MatchString(contractData.ThirdPartyName) {
		return &openapi.ValidationError{
			ErrorMessage: "Third party name must be between 2 and 100 characters",
		}
	}

	if openapi.ContractStatus(contractData.Status) != openapi.ContractStatusProposed &&
		openapi.ContractStatus(contractData.Status) != openapi.ContractStatusActive &&
		openapi.ContractStatus(contractData.Status) != openapi.ContractStatusExpired {
		return &openapi.ValidationError{
			ErrorMessage: "Status must be proposed, active, or expired",
		}
	}

	if contractData.StartDate == "" {
		return &openapi.ValidationError{
			ErrorMessage: "Start date is required",
		}
	}

	// Validate start date format
	startDate, err := time.Parse(config.DateFormat, contractData.StartDate)
	if err != nil {
		return &openapi.ValidationError{
			ErrorMessage: "Invalid start date format",
		}
	}

	if contractData.ExpiryDate == "" {
		return &openapi.ValidationError{
			ErrorMessage: "Expiry date is required",
		}
	}

	// Validate expiry date format
	expiryDate, err := time.Parse(config.DateFormat, contractData.ExpiryDate)
	if err != nil {
		return &openapi.ValidationError{
			ErrorMessage: "Invalid expiry date format",
		}
	}

	if !startDate.Before(expiryDate) {
		return &openapi.ValidationError{
			ErrorMessage: "Start date must be before expiry date",
		}
	}

	// TODO: do we want some sort of validation for the assets?

	return nil
}

func (s *Service) StoreContract(
	ctx context.Context,
	studyID uuid.UUID,
	pdfContractObj types.S3Object,
	contractMetadata types.Contract,
) error {
	log.Debug().Str("filename", contractMetadata.Filename).Msg("Storing contract")

	// Start a database transaction
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Store the contract metadata in the database first to generate an ID
	if err := tx.Create(&contractMetadata).Error; err != nil {
		tx.Rollback()
		return types.NewErrFromGorm(err, "failed to save contract metadata")
	}

	log.Debug().Any("contractId", contractMetadata.ID).Msg("Contract metadata saved, proceeding with S3 storage")

	// Store the PDF file in S3 using the generated primary key ID from the database
	metadata := s3.ObjectMetadata{
		Id:   contractMetadata.ID,
		Kind: s3.ContractKind,
	}
	if err := s.s3.StoreObject(ctx, metadata, pdfContractObj); err != nil {
		tx.Rollback()
		return err
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		return types.NewErrFromGorm(err, "failed to commit contract transaction")
	}

	return nil
}

func (s *Service) GetContract(ctx context.Context,
	studyID uuid.UUID,
	contractID uuid.UUID,
) (types.S3Object, error) {
	log.Debug().Any("contractID", contractID).Msg("Getting contract")

	if exists, err := s.contractExists(studyID, contractID); err != nil {
		return types.S3Object{}, err
	} else if !exists {
		return types.S3Object{}, types.NewNotFoundError(fmt.Errorf("contract did not exist for study [%v]", studyID))
	}

	metadata := s3.ObjectMetadata{
		Id:   contractID,
		Kind: s3.ContractKind,
	}
	return s.s3.GetObject(ctx, metadata)
}

func (s *Service) UpdateContract(
	ctx context.Context,
	studyID uuid.UUID,
	contractID uuid.UUID,
	contractMetadata types.Contract,
	pdfContractObj *types.S3Object,
) error {
	log.Debug().Any("contractId", contractID).Msg("Updating contract")

	if exists, err := s.contractExists(studyID, contractID); err != nil {
		return err
	} else if !exists {
		return types.NewNotFoundError(fmt.Errorf("contract did not exist for study [%v]", studyID))
	}

	// Start a database transaction
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// If a new file is provided, update the filename and replace the file in S3
	if pdfContractObj != nil {
		metadata := s3.ObjectMetadata{
			Id:   contractID,
			Kind: s3.ContractKind,
		}
		if err := s.s3.StoreObject(ctx, metadata, *pdfContractObj); err != nil {
			tx.Rollback()
			return err
		}
	}

	// Update the database record
	result := tx.Model(&types.Contract{}).
		Where("id = ? AND study_id = ?", contractID, contractMetadata.StudyID).
		Updates(contractMetadata)

	if result.Error != nil {
		tx.Rollback()
		return types.NewErrFromGorm(result.Error, "failed to update contract")
	}

	if err := tx.Commit().Error; err != nil {
		return types.NewErrFromGorm(err, "failed to commit contract update transaction")
	}

	return nil
}

func (s *Service) contractExists(studyID uuid.UUID, contractID uuid.UUID) (bool, error) {
	exists := false
	err := s.db.Model(&types.Contract{}).
		Select("count(*) > 0").
		Where("study_id = ? AND id = ?", studyID, contractID).
		Find(&exists).Error
	return exists, types.NewErrFromGorm(err, "failed check if contract exists")
}

// retrieves all contracts within a study
func (s *Service) StudyContracts(studyID uuid.UUID) ([]types.Contract, error) {
	contracts := []types.Contract{}
	err := s.db.Where("contracts.study_id = ?", studyID).
		Order("created_at DESC").
		Find(&contracts).Error
	return contracts, types.NewErrFromGorm(err, "failed to get asset contracts")
}
