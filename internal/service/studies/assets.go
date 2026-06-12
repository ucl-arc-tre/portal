package studies

import (
	"fmt"
	"slices"
	"time"

	"github.com/google/uuid"
	"github.com/rs/zerolog/log"

	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
	"github.com/ucl-arc-tre/portal/internal/validation"
)

func (s *Service) validateAssetData(data openapi.AssetBase) error {
	if !validation.AssetTitlePattern.MatchString(data.Title) {
		return types.NewErrClientInvalidObjectF("asset title must be 4-50 characters, start and end with a letter/number, and contain only letters, numbers, spaces, hyphens and apostrophes")
	}

	if !validation.AssetDescriptionPattern.MatchString(data.Description) {
		return types.NewErrClientInvalidObjectF("asset description must be 4-255 characters")
	}

	if !data.ClassificationImpact.Valid() {
		return types.NewErrClientInvalidObjectF("classification_impact must be one of: public, confidential, highly_confidential")
	}

	if data.Tier < 0 || data.Tier > 4 {
		return types.NewErrClientInvalidObjectF("tier must be between 0 and 4")
	}

	if len(data.Locations) == 0 {
		return types.NewErrClientInvalidObjectF("at least one location must be specified")
	}

	isPersonal := slices.Contains(data.DataTypes, openapi.AssetBaseDataTypesPersonal)
	isSpecialCategoryPersonal := slices.Contains(data.DataTypes, openapi.AssetBaseDataTypesSpecialCategoryPersonal)
	if (isPersonal || isSpecialCategoryPersonal) && (data.Protection == nil || data.LegalBasis == nil) {
		return types.NewErrClientInvalidObjectF("non-public personal or special category data must have an applied protection and legal basis")
	}
	if isSpecialCategoryPersonal && data.LegalBasisSpecial == nil {
		return types.NewErrClientInvalidObjectF("non-public special category personal data must additional condition")
	}

	if data.Protection != nil && !data.Protection.Valid() {
		return types.NewErrClientInvalidObjectF("protection must be one of: anonymisation, pseudonymisation, identifiable_low_confidence_pseudonymisation")
	}

	if data.LegalBasis != nil && !data.LegalBasis.Valid() {
		return types.NewErrClientInvalidObjectF("invalid legal basis")
	}

	if data.LegalBasisSpecial != nil && !data.LegalBasisSpecial.Valid() {
		return types.NewErrClientInvalidObjectF("invalid special legal basis")
	}

	if !data.Format.Valid() {
		return types.NewErrClientInvalidObjectF("invalid format. must be one of: electronic, paper, other")
	}

	if !data.Status.Valid() {
		return types.NewErrClientInvalidObjectF("invalid status")
	}

	for _, dataType := range data.DataTypes {
		if !dataType.Valid() {
			return types.NewErrClientInvalidObjectF("data type [%v] was not valid", dataType)
		}
	}

	// Validate expiry field if provided
	if data.ExpiresAt != nil {
		if _, err := time.Parse(config.DateFormat, *data.ExpiresAt); err != nil {
			return types.NewErrClientInvalidObjectF("expiry date must be in %s format", config.DateFormat)
		}
	}

	return nil
}

func assetFromBase(data openapi.AssetBase) (*types.Asset, error) {
	asset := &types.Asset{
		Title:                         data.Title,
		Description:                   data.Description,
		Source:                        data.Source,
		ClassificationImpact:          string(data.ClassificationImpact),
		Tier:                          data.Tier,
		Format:                        string(data.Format),
		HasDspt:                       data.HasDspt,
		RequiresContract:              data.RequiresContract,
		StoredOutsideUkEea:            data.StoredOutsideUkEea,
		Status:                        string(data.Status),
		IsLeakMajorDisruption:         data.IsLeakMajorDisruption,
		IsLeakMajorFinancialLoss:      data.IsLeakMajorFinancialLoss,
		IsLeakMajorReputationalDamage: data.IsLeakMajorReputationalDamage,
		RequiresTre:                   data.RequiresTre,
		HasTargetedThreatActors:       data.HasTargetedThreatActors,
	}
	if data.Protection != nil {
		asset.Protection = new(string(*data.Protection))
	}
	if data.LegalBasis != nil {
		asset.LegalBasis = new(string(*data.LegalBasis))
	}
	if data.LegalBasisSpecial != nil {
		asset.LegalBasisSpecial = new(string(*data.LegalBasisSpecial))
	}
	if data.ExpiresAt != nil {
		parsedDateTime, err := time.Parse(config.DateFormat, *data.ExpiresAt)
		if err != nil {
			return nil, types.NewErrInvalidObjectF("failed to parse validated expiry date %s: %v", *data.ExpiresAt, err)
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

	for _, dataTypeStr := range assetData.DataTypes {
		assetDataType := types.AssetDataType{
			AssetID: asset.ID,
			Name:    string(dataTypeStr),
		}
		if err := tx.Create(&assetDataType).Error; err != nil {
			tx.Rollback()
			return types.NewErrFromGorm(err, "failed to create asset data type")
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

	existingLocations := []types.AssetLocation{}
	if err := tx.Unscoped().
		Where("asset_id = ?", assetID).
		Find(&existingLocations).Error; err != nil {
		tx.Rollback()
		return nil, types.NewErrFromGorm(err, "failed to list existing asset locations")
	}
	newLocations := []types.AssetLocation{}
	for _, locationStr := range assetData.Locations {
		newLocations = append(newLocations, types.AssetLocation{
			AssetID:  assetID,
			Location: locationStr,
		})
	}
	if err := graceful.UpdateManyExisting(tx, existingLocations, newLocations); err != nil {
		tx.Rollback()
		return nil, types.NewErrFromGorm(err, "failed to update asset locations")
	}

	existingDataTypes := []types.AssetDataType{}
	if err := tx.Unscoped().
		Where("asset_id = ?", assetID).
		Find(&existingDataTypes).Error; err != nil {
		tx.Rollback()
		return nil, types.NewErrFromGorm(err, "failed to list existing asset data types")
	}
	newDataTypes := []types.AssetDataType{}
	for _, dataTypeStr := range assetData.DataTypes {
		newDataTypes = append(newDataTypes, types.AssetDataType{
			AssetID: assetID,
			Name:    string(dataTypeStr),
		})
	}
	if err := graceful.UpdateManyExisting(tx, existingDataTypes, newDataTypes); err != nil {
		tx.Rollback()
		return nil, types.NewErrFromGorm(err, "failed to update asset data types")
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
		return types.NewErrClientInvalidObjectF("cannot delete asset that is linked to one or more contracts, please unlink the asset from all contracts before deleting")
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
	err := s.db.Preload("Locations").Preload("DataTypes").Preload("Contracts.Assets").Where("study_id = ?", studyID).Find(&assets).Error
	return assets, types.NewErrFromGorm(err, "failed to get assets")
}

// retrieves a specific asset within a study
func (s *Service) AssetById(studyID uuid.UUID, assetID uuid.UUID) (types.Asset, error) {
	asset := types.Asset{}
	err := s.db.Preload("Locations").Preload("DataTypes").Preload("Contracts.Assets").Where("study_id = ? AND id = ?", studyID, assetID).First(&asset).Error
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
