package studies

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/controller/s3"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
	"github.com/ucl-arc-tre/portal/internal/validation"
)

func (s *Service) ValidateContractMetadata(studyId uuid.UUID, data openapi.ContractBase) *openapi.ValidationError {
	// Only validate file extension if a filename is provided (for an updated contract, file is optional)
	if !validation.ContractNamePattern.MatchString(data.OrganisationSignatory) {
		return &openapi.ValidationError{
			ErrorMessage: "Organisation signatory must be between 2 and 100 characters",
		}
	}

	if !validation.ContractNamePattern.MatchString(data.ThirdPartyName) {
		return &openapi.ValidationError{
			ErrorMessage: "Third party name must be between 2 and 100 characters",
		}
	}

	if openapi.ContractStatus(data.Status) != openapi.ContractStatusProposed &&
		openapi.ContractStatus(data.Status) != openapi.ContractStatusActive &&
		openapi.ContractStatus(data.Status) != openapi.ContractStatusExpired {
		return &openapi.ValidationError{
			ErrorMessage: "Status must be proposed, active, or expired",
		}
	}

	if data.StartDate == "" {
		return &openapi.ValidationError{
			ErrorMessage: "Start date is required",
		}
	}

	// Validate start date format
	startDate, err := time.Parse(config.DateFormat, data.StartDate)
	if err != nil {
		return &openapi.ValidationError{
			ErrorMessage: "Invalid start date format",
		}
	}

	if data.ExpiryDate == "" {
		return &openapi.ValidationError{
			ErrorMessage: "Expiry date is required",
		}
	}

	// Validate expiry date format
	expiryDate, err := time.Parse(config.DateFormat, data.ExpiryDate)
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

	var numExistingAssets int64
	err = s.db.Model(types.Asset{}).Where("study_id = ? AND id in ?", studyId, data.AssetIds).Count(&numExistingAssets).Error
	if err != nil {
		log.Err(err).Msg("Failed to find matching assets")
		return &openapi.ValidationError{
			ErrorMessage: "Failed to find matching assets",
		}
	} else if numExistingAssets != int64(len(data.AssetIds)) {
		return &openapi.ValidationError{
			ErrorMessage: "Did not find existing study assets",
		}
	}

	return nil
}

func (s *Service) CreateContract(
	studyID uuid.UUID,
	contractBase openapi.ContractBase,
) error {
	log.Debug().Msg("Storing contract")

	contract := types.Contract{
		StudyID: studyID,
	}

	// Store the contract metadata in the database first to generate an ID
	if err := s.db.Create(&contract).Error; err != nil {
		return types.NewErrFromGorm(err, "failed to create contract metadata")
	}

	return nil
}

func (s *Service) StoreContract(
	ctx context.Context,
	studyID uuid.UUID,
	contractID uuid.UUID,
	pdfContractObj types.S3Object,
) error {
	if exists, err := s.contractExists(studyID, contractID); err != nil {
		return err
	} else if !exists {
		return types.NewErrInvalidObject("cannot store a contract without metadata")
	}

	log.Debug().Str("contractID", contractID.String()).Msg("Storing contract")

	// Start a database transaction
	tx := s.db.Begin()
	defer graceful.RollbackTransactionOnPanic(tx)

	// Store the contract metadata in the database first to generate an ID
	if err := tx.Create(&contractMetadata).Error; err != nil {
		tx.Rollback()
		return types.NewErrFromGorm(err, "failed to save contract metadata")
	}

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
	defer graceful.RollbackTransactionOnPanic(tx)

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

	assoc := tx.Model(&contractMetadata).Association("Assets")
	if err := assoc.Replace(contractMetadata.Assets); err != nil {
		tx.Rollback()
		return types.NewErrFromGorm(err, "failed to update contract assets")
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
	err := s.db.Preload("Assets").Where("study_id = ?", studyID).
		Order("created_at DESC").
		Find(&contracts).Error
	return contracts, types.NewErrFromGorm(err, "failed to get asset contracts")

}
