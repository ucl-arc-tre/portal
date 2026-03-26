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
	"gorm.io/gorm"
)

func (s *Service) ValidateContract(studyId uuid.UUID, data openapi.ContractBase) *openapi.ValidationError {
	if !validation.ContractNamePattern.MatchString(data.Title) {
		return openapi.NewValidationError("Title must be between 2 and 100 characters")
	}

	if !validation.ContractNamePattern.MatchString(data.OrganisationSignatory) {
		return openapi.NewValidationError("Organisation signatory must be between 2 and 100 characters")
	}

	if !validation.ContractNamePattern.MatchString(data.ThirdPartyName) {
		return openapi.NewValidationError("Third party name must be between 2 and 100 characters")
	}

	if openapi.ContractStatus(data.Status) != openapi.ContractStatusProposed &&
		openapi.ContractStatus(data.Status) != openapi.ContractStatusActive &&
		openapi.ContractStatus(data.Status) != openapi.ContractStatusExpired {
		return openapi.NewValidationError("Status must be proposed, active, or expired")
	}

	if data.StartDate == "" {
		return openapi.NewValidationError("Start date is required")
	}

	// Validate start date format
	startDate, err := time.Parse(config.DateFormat, data.StartDate)
	if err != nil {
		return openapi.NewValidationError("Invalid start date format")
	}

	if data.ExpiryDate == "" {
		return openapi.NewValidationError("Expiry date is required")
	}

	// Validate expiry date format
	expiryDate, err := time.Parse(config.DateFormat, data.ExpiryDate)
	if err != nil {
		return openapi.NewValidationError("Invalid expiry date format")
	}

	if !startDate.Before(expiryDate) {
		return openapi.NewValidationError("Start date must be before expiry date")
	}

	var numExistingAssets int64
	err = s.db.Model(types.Asset{}).Where("study_id = ? AND id in ?", studyId, data.AssetIds).Count(&numExistingAssets).Error
	if err != nil {
		log.Err(err).Msg("Failed to find matching assets")
		return openapi.NewValidationError("Failed to find matching assets")
	} else if numExistingAssets != int64(len(data.AssetIds)) {
		return openapi.NewValidationError("Did not find existing study assets")
	}

	return nil
}

func (s *Service) CreateContract(
	studyID uuid.UUID,
	contractBase openapi.ContractBase,
	creator types.User,
) (*types.Contract, error) {
	log.Debug().Msg("Storing contract")

	contract, err := contractFromBase(contractBase)
	if err != nil {
		return nil, err
	}
	contract.StudyID = studyID
	contract.CreatorUserID = creator.ID

	// Store the contract metadata in the database first to generate an ID
	if err := s.db.Create(&contract).Error; err != nil {
		return nil, types.NewErrFromGorm(err, "failed to create contract metadata")
	}

	return contract, nil
}

func (s *Service) GetContract(studyID uuid.UUID, contractID uuid.UUID) (*types.Contract, error) {
	contract := types.Contract{}
	result := s.db.Model(&contract).
		Preload("Objects").
		Preload("Assets").
		Where("id = ? AND study_id = ?", contractID, studyID).
		First(&contract)
	return &contract, types.NewErrFromGorm(result.Error, "failed to get contract")
}

func (s *Service) CreateContractObject(
	ctx context.Context,
	studyID uuid.UUID,
	obj ContractObject,
) (*types.ContractObjectMetadata, error) {
	if err := s.checkContractExists(studyID, obj.Meta.ContractID); err != nil {
		return nil, err
	}

	if !validation.IsValidContractFilename(obj.Meta.Filename) {
		return nil, types.NewErrInvalidObject("filename was invalid")
	}

	log.Debug().Str("contractID", obj.Meta.ContractID.String()).Msg("Storing contract")

	// Start a database transaction
	tx := s.db.Begin()
	defer graceful.RollbackTransactionOnPanic(tx)

	// Store the contract metadata in the database first to generate an ID
	if err := tx.Create(&obj.Meta).Error; err != nil {
		tx.Rollback()
		return nil, types.NewErrFromGorm(err, "failed to save contract metadata")
	}

	// Store the PDF file in S3 using the generated primary key ID from the database
	metadata := s3.ObjectMetadata{
		Id:   obj.Meta.ID,
		Kind: s3.ContractKind,
	}
	if err := s.s3.StoreObject(ctx, metadata, obj.Object); err != nil {
		tx.Rollback()
		return nil, err
	}

	return &obj.Meta, commitTransaction(tx)
}

func (s *Service) GetContractObject(ctx context.Context,
	studyID uuid.UUID,
	contractID uuid.UUID,
	contractObjectID uuid.UUID,
) (types.S3Object, error) {
	log.Debug().Any("contractID", contractID).Msg("Getting contract")

	if err := s.checkContractObjectExists(studyID, contractID, contractObjectID); err != nil {
		return types.S3Object{}, err
	}

	metadata := s3.ObjectMetadata{
		Id:   contractObjectID,
		Kind: s3.ContractKind,
	}
	return s.s3.GetObject(ctx, metadata)
}

func (s *Service) DeleteContractObject(ctx context.Context,
	studyID uuid.UUID,
	contractID uuid.UUID,
	contractObjectID uuid.UUID,
) error {
	if err := s.checkContractObjectExists(studyID, contractID, contractObjectID); err != nil {
		return err
	}

	tx := s.db.Begin()
	defer graceful.RollbackTransactionOnPanic(tx)

	result := tx.Where("id = ? AND contract_id = ?", contractObjectID, contractID).
		Delete(&types.ContractObjectMetadata{})
	if err := result.Error; err != nil {
		tx.Rollback()
		return types.NewErrFromGorm(err, "Failed to delete contract object metadata")
	}

	metadata := s3.ObjectMetadata{
		Id:   contractObjectID,
		Kind: s3.ContractKind,
	}
	if err := s.s3.DeleteObject(metadata); err != nil {
		tx.Rollback()
		return err
	}

	return commitTransaction(tx)
}

func (s *Service) UpdateContract(
	ctx context.Context,
	studyID uuid.UUID,
	contractID uuid.UUID,
	contractBase openapi.ContractBase,
) (*types.Contract, error) {
	log.Debug().Any("contractId", contractID).Msg("Updating contract")

	if err := s.checkContractExists(studyID, contractID); err != nil {
		return nil, err
	}

	tx := s.db.Begin()
	defer graceful.RollbackTransactionOnPanic(tx)

	contract, err := contractFromBase(contractBase)
	if err != nil {
		return nil, err
	}
	contract.ID = contractID
	contract.StudyID = studyID

	result := tx.Model(&types.Contract{}).
		Where("id = ? AND study_id = ?", contractID, studyID).
		Updates(contract)

	if result.Error != nil {
		tx.Rollback()
		return nil, types.NewErrFromGorm(result.Error, "failed to update contract")
	}

	assoc := tx.Model(contract).Association("Assets")
	if err := assoc.Replace(contract.Assets); err != nil {
		tx.Rollback()
		return nil, types.NewErrFromGorm(err, "failed to update contract assets")
	}

	if err := tx.Preload("Assets").Preload("Objects").First(contract, contractID).Error; err != nil {
		tx.Rollback()
		return nil, types.NewErrFromGorm(result.Error, "failed to get updated contract")
	}

	return contract, commitTransaction(tx)
}

func (s *Service) checkContractExists(studyID uuid.UUID, contractID uuid.UUID) error {
	exists := false
	err := s.db.Model(&types.Contract{}).
		Select("count(*) > 0").
		Where("study_id = ? AND id = ?", studyID, contractID).
		Find(&exists).Error
	if err != nil {
		return types.NewErrFromGorm(err, "failed check if contract exists")
	} else if !exists {
		return types.NewNotFoundError(fmt.Errorf("contract did not exist for study [%v]", studyID))
	}
	return nil
}

func (s *Service) checkContractObjectExists(studyID uuid.UUID, contractID uuid.UUID, contractObjectID uuid.UUID) error {
	exists := false
	err := s.db.Model(&types.ContractObjectMetadata{}).
		Joins("INNER JOIN contracts on contracts.id = contract_object_metadata.contract_id").
		Select("count(*) > 0").
		Where("study_id = ? AND contract_id = ? AND contract_object_metadata.id = ?", studyID, contractID, contractObjectID).
		Find(&exists).Error
	if err != nil {
		return types.NewErrFromGorm(err, "failed check if contract exists")
	} else if !exists {
		return types.NewNotFoundError(fmt.Errorf("contract object did not exist"))
	}
	return nil
}

// retrieves all contracts within a study
func (s *Service) StudyContracts(studyID uuid.UUID) ([]types.Contract, error) {
	contracts := []types.Contract{}
	err := s.db.Preload("Assets").Preload("Objects").Where("study_id = ?", studyID).
		Order("created_at DESC").
		Find(&contracts).Error
	return contracts, types.NewErrFromGorm(err, "failed to get asset contracts")
}

func contractFromBase(contractBase openapi.ContractBase) (*types.Contract, error) {
	startDate, err := time.Parse(config.DateFormat, contractBase.StartDate)
	if err != nil {
		return nil, types.NewErrInvalidObject("invalid start date format")
	}

	expiryDate, err := time.Parse(config.DateFormat, contractBase.ExpiryDate)
	if err != nil {
		return nil, types.NewErrInvalidObject("invalid end date format")
	}

	contract := types.Contract{
		Title:                 contractBase.Title,
		OrganisationSignatory: contractBase.OrganisationSignatory,
		ThirdPartyName:        contractBase.ThirdPartyName,
		StartDate:             startDate,
		ExpiryDate:            expiryDate,
		Status:                string(contractBase.Status),
	}

	for _, assetID := range contractBase.AssetIds {
		assetUUID, err := uuid.Parse(assetID)
		if err != nil {
			return nil, types.NewErrInvalidObject(err)
		}
		asset := types.Asset{}
		asset.ID = assetUUID
		contract.Assets = append(contract.Assets, asset)
	}

	return &contract, nil
}

func commitTransaction(tx *gorm.DB) error {
	if err := tx.Commit().Error; err != nil {
		return types.NewErrFromGorm(err, "failed to commit contract transaction")
	}
	return nil
}
