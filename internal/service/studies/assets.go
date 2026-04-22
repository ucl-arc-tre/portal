package studies

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/rs/zerolog/log"

	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
	"github.com/ucl-arc-tre/portal/internal/validation"
)

func (s *Service) validateAssetData(assetData openapi.AssetBase) error {
	if !validation.AssetTitlePattern.MatchString(assetData.Title) {
		return types.NewErrClientInvalidObjectF("asset title must be 4-50 characters, start and end with a letter/number, and contain only letters, numbers, spaces, and hyphens")
	}

	if !validation.AssetDescriptionPattern.MatchString(assetData.Description) {
		return types.NewErrClientInvalidObjectF("asset description must be 4-255 characters")
	}

	if !assetData.ClassificationImpact.Valid() {
		return types.NewErrClientInvalidObjectF("classification_impact must be one of: public, confidential, highly_confidential")
	}

	if assetData.Tier < 0 || assetData.Tier > 4 {
		return types.NewErrClientInvalidObjectF("tier must be between 0 and 4")
	}

	if len(assetData.Locations) == 0 {
		return types.NewErrClientInvalidObjectF("at least one location must be specified")
	}

	if !assetData.Protection.Valid() {
		return types.NewErrClientInvalidObjectF("protection must be one of: anonymisation, pseudonymisation, identifiable_low_confidence_pseudonymisation")
	}

	if !assetData.LegalBasis.Valid() {
		return types.NewErrClientInvalidObjectF("invalid legal basis")
	}

	if !assetData.Format.Valid() {
		return types.NewErrClientInvalidObjectF("invalid format. must be one of: electronic, paper, other")
	}

	if !assetData.Status.Valid() {
		return types.NewErrClientInvalidObjectF("invalid status")
	}

	// Validate expiry field if provided
	if assetData.ExpiresAt != nil {
		if _, err := time.Parse(config.DateFormat, *assetData.ExpiresAt); err != nil {
			return types.NewErrClientInvalidObjectF("expiry date must be in %s format", config.DateFormat)
		}
	}

	return nil
}

// handles the database transaction for creating a study asset
func assetFromBase(assetData openapi.AssetBase) (*types.Asset, error) {

	asset := &types.Asset{
		Title:                assetData.Title,
		Description:          assetData.Description,
		ClassificationImpact: string(assetData.ClassificationImpact),
		Tier:                 assetData.Tier,
		Protection:           string(assetData.Protection),
		LegalBasis:           string(assetData.LegalBasis),
		Format:               string(assetData.Format),
		HasDspt:              assetData.HasDspt,
		RequiresContract:     assetData.RequiresContract,
		StoredOutsideUkEea:   assetData.StoredOutsideUkEea,
		Status:               string(assetData.Status),
	}

	if assetData.ExpiresAt != nil {
		parsedDateTime, err := time.Parse(config.DateFormat, *assetData.ExpiresAt)
		if err != nil {
			return nil, types.NewErrInvalidObjectF("failed to parse validated expiry date %s: %v", *assetData.ExpiresAt, err)
		}
		asset.ExpiresAt = &parsedDateTime
	}

	return asset, nil
}

func (s *Service) checkAssetExists(studyID uuid.UUID, assetID uuid.UUID) error {
	exists := false
	err := s.db.Model(&types.Asset{}).
		Select("count(*) > 0").
		Where("study_id = ? AND id = ?", studyID, assetID).
		Find(&exists).Error
	if err != nil {
		return types.NewErrFromGorm(err, "failed to check if asset exists")
	} else if !exists {
		return types.NewNotFoundError(fmt.Errorf("asset [%v] not found in study [%v]", assetID, studyID))
	}
	return nil
}

func (s *Service) CreateAsset(creator types.User, assetData openapi.AssetBase, studyID uuid.UUID) error {
	log.Debug().Any("studyID", studyID).Any("creator", creator).Msg("Creating asset")

	if err := s.validateAssetData(assetData); err != nil {
		return err
	}

	asset, err := assetFromBase(assetData)
	if err != nil {
		return err
	}
	asset.CreatorUserID = creator.ID
	asset.StudyID = studyID

	tx := s.db.Begin()
	defer graceful.RollbackTransactionOnPanic(tx)

	if err := tx.Create(asset).Error; err != nil {
		tx.Rollback()
		return types.NewErrFromGorm(err, "failed to create asset")
	}

	for _, locationStr := range assetData.Locations {
		assetLocation := types.AssetLocation{
			AssetID:  asset.ID,
			Location: locationStr,
		}
		if err := tx.Create(&assetLocation).Error; err != nil {
			tx.Rollback()
			return types.NewErrFromGorm(err, "failed to create asset location")
		}
	}

	return commitTransaction(tx)
}

func (s *Service) UpdateAsset(assetData openapi.AssetBase, studyID uuid.UUID, assetID uuid.UUID) (*types.Asset, error) {
	log.Debug().Any("studyID", studyID).Any("assetID", assetID).Msg("Updating asset")

	if err := s.validateAssetData(assetData); err != nil {
		return nil, err
	}

	// verifies the asset exists and returns the existing asset so we can preserve uneditable fields
	existingAsset, err := s.AssetById(studyID, assetID)
	if err != nil {
		return nil, err
	}

	asset, err := assetFromBase(assetData)
	if err != nil {
		return nil, err
	}
	asset.ID = assetID
	asset.StudyID = studyID
	asset.CreatorUserID = existingAsset.CreatorUserID

	tx := s.db.Begin()
	defer graceful.RollbackTransactionOnPanic(tx)

	if err := tx.Model(asset).Select("*").Where("id = ? AND study_id = ?", assetID, studyID).Updates(asset).Error; err != nil {
		tx.Rollback()
		return nil, types.NewErrFromGorm(err, "failed to update asset")
	}

	if err := tx.Where("asset_id = ?", assetID).Delete(&types.AssetLocation{}).Error; err != nil {
		tx.Rollback()
		return nil, types.NewErrFromGorm(err, "failed to delete asset locations")
	}

	for _, locationStr := range assetData.Locations {
		assetLocation := types.AssetLocation{
			AssetID:  assetID,
			Location: locationStr,
		}
		if err := tx.Create(&assetLocation).Error; err != nil {
			tx.Rollback()
			return nil, types.NewErrFromGorm(err, "failed to create asset location")
		}
	}

	if err := commitTransaction(tx); err != nil {
		return nil, err
	}

	updatedAsset, err := s.AssetById(studyID, assetID)
	if err != nil {
		return nil, err
	}

	return &updatedAsset, nil
}

func (s *Service) DeleteAsset(studyID uuid.UUID, assetID uuid.UUID) error {
	log.Debug().Any("studyID", studyID).Any("assetID", assetID).Msg("Deleting asset")

	if err := s.checkAssetExists(studyID, assetID); err != nil {
		return err
	}

	asset, err := s.AssetById(studyID, assetID)
	if err != nil {
		return err
	}

	if len(asset.Contracts) > 0 {
		return types.NewErrClientInvalidObjectF("cannot delete asset that is linked to one or more contracts")
	}

	tx := s.db.Begin()
	defer graceful.RollbackTransactionOnPanic(tx)

	if err := tx.Where("asset_id = ?", assetID).Delete(&types.AssetLocation{}).Error; err != nil {
		tx.Rollback()
		return types.NewErrFromGorm(err, "failed to delete asset locations")
	}

	if err := tx.Where("id = ? AND study_id = ?", assetID, studyID).Delete(&types.Asset{}).Error; err != nil {
		tx.Rollback()
		return types.NewErrFromGorm(err, "failed to delete asset")
	}

	return commitTransaction(tx)
}

// retrieves all assets for a study
func (s *Service) Assets(studyID uuid.UUID) ([]types.Asset, error) {
	assets := []types.Asset{}
	err := s.db.Preload("Locations").Preload("Contracts.Assets").Where("study_id = ?", studyID).Find(&assets).Error
	return assets, types.NewErrFromGorm(err, "failed to get assets")
}

// retrieves a specific asset within a study
func (s *Service) AssetById(studyID uuid.UUID, assetID uuid.UUID) (types.Asset, error) {
	asset := types.Asset{}
	err := s.db.Preload("Locations").Preload("Contracts.Assets").Where("study_id = ? AND id = ?", studyID, assetID).First(&asset).Error
	return asset, types.NewErrFromGorm(err, "failed to get asset by id")
}

// retrieves all contracts for a specific asset within a study
func (s *Service) AssetContracts(studyID uuid.UUID, assetID uuid.UUID) ([]types.Contract, error) {
	asset := types.Asset{}
	err := s.db.Preload("Contracts.Assets").Preload("Contracts.SignatoryUser").
		Where("id = ? AND study_id = ?", assetID, studyID).
		Order("created_at DESC").
		Find(&asset).Error

	return asset.Contracts, types.NewErrFromGorm(err, "failed to get asset contracts")
}
