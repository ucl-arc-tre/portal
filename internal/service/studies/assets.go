package studies

import (
	"fmt"
	"time"

	"slices"

	"github.com/google/uuid"
	"github.com/rs/zerolog/log"

	"github.com/ucl-arc-tre/portal/internal/config"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
	"github.com/ucl-arc-tre/portal/internal/validation"
)

func (s *Service) validateAssetData(assetData openapi.AssetBase) (*openapi.ValidationError, error) {
	// Validate title
	if !validation.AssetTitlePattern.MatchString(assetData.Title) {
		return &openapi.ValidationError{ErrorMessage: "asset title must be 4-50 characters, start and end with a letter/number, and contain only letters, numbers, spaces, and hyphens"}, nil
	}

	// Validate description
	if !validation.AssetDescriptionPattern.MatchString(assetData.Description) {
		return &openapi.ValidationError{ErrorMessage: "asset description must be 4-255 characters"}, nil
	}

	// Validate classification_impact
	validClassifications := []openapi.AssetBaseClassificationImpact{
		openapi.AssetBaseClassificationImpactPublic,
		openapi.AssetBaseClassificationImpactConfidential,
		openapi.AssetBaseClassificationImpactHighlyConfidential,
	}
	if !slices.Contains(validClassifications, assetData.ClassificationImpact) {
		return &openapi.ValidationError{ErrorMessage: "classification_impact must be one of: public, confidential, highly_confidential"}, nil
	}

	// Validate tier
	if assetData.Tier < 0 || assetData.Tier > 4 {
		return &openapi.ValidationError{ErrorMessage: "tier must be between 0 and 4"}, nil
	}

	// Validate locations
	if len(assetData.Locations) == 0 {
		return &openapi.ValidationError{ErrorMessage: "at least one location must be specified"}, nil
	}

	// Validate protection field
	validProtections := []openapi.AssetBaseProtection{
		openapi.AssetBaseProtectionAnonymisation,
		openapi.AssetBaseProtectionPseudonymisation,
		openapi.AssetBaseProtectionIdentifiableLowConfidencePseudonymisation,
	}
	if !slices.Contains(validProtections, assetData.Protection) {
		return &openapi.ValidationError{ErrorMessage: "protection must be one of: anonymisation, pseudonymisation, identifiable_low_confidence_pseudonymisation"}, nil
	}

	// Validate legal_basis
	if !validation.TextField500Pattern.MatchString(assetData.LegalBasis) {
		return &openapi.ValidationError{ErrorMessage: "legal_basis must be 1-500 characters"}, nil
	}

	// Validate format field
	validFormats := []openapi.AssetBaseFormat{
		openapi.AssetBaseFormatElectronic,
		openapi.AssetBaseFormatPaper,
		openapi.AssetBaseFormatOther,
	}
	if !slices.Contains(validFormats, assetData.Format) {
		return &openapi.ValidationError{ErrorMessage: "format must be one of: electronic, paper, other"}, nil
	}

	// Validate expiry field
	_, err := time.Parse(config.DateFormat, assetData.ExpiresAt)
	if err != nil {
		return &openapi.ValidationError{ErrorMessage: "expiry date must be in YYYY-MM-DD format"}, nil
	}

	// Validate status field
	validStatuses := []openapi.AssetBaseStatus{
		openapi.AssetBaseStatusActive,
		openapi.AssetBaseStatusAwaiting,
		openapi.AssetBaseStatusDestroyed,
	}
	if !slices.Contains(validStatuses, assetData.Status) {
		return &openapi.ValidationError{ErrorMessage: "status must be one of: active, awaiting, destroyed"}, nil
	}

	return nil, nil
}

func (s *Service) CreateAsset(user types.User, assetData openapi.AssetBase, studyID uuid.UUID) (*openapi.ValidationError, error) {
	log.Debug().Any("studyID", studyID).Any("user", user).Msg("Creating asset")

	validationError, err := s.validateAssetData(assetData)
	if err != nil || validationError != nil {
		return validationError, err
	}

	_, err = s.createStudyAsset(user, assetData, studyID)
	return nil, err
}

// handles the database transaction for creating a study asset
func (s *Service) createStudyAsset(user types.User, assetData openapi.AssetBase, studyID uuid.UUID) (*types.Asset, error) {
	// Start a transaction
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Parse the expiry date string (already validated in validateAssetData)
	expiryDate, err := time.Parse(config.DateFormat, assetData.ExpiresAt)
	if err != nil {
		panic(fmt.Sprintf("failed to parse validated expiry date %s: %v", assetData.ExpiresAt, err))
	}

	// Create the Asset with proper fields from AssetBase
	asset := types.Asset{
		CreatorUserID:        user.ID,
		StudyID:              studyID,
		Title:                assetData.Title,
		Description:          assetData.Description,
		ClassificationImpact: string(assetData.ClassificationImpact),
		Tier:                 assetData.Tier,
		Protection:           string(assetData.Protection),
		LegalBasis:           assetData.LegalBasis,
		Format:               string(assetData.Format),
		ExpiresAt:            expiryDate,
		HasDspt:              assetData.HasDspt,
		RequiresContract:     assetData.RequiresContract,
		StoredOutsideUkEea:   assetData.StoredOutsideUkEea,
		Status:               string(assetData.Status),
	}

	// Create the asset
	if err := tx.Create(&asset).Error; err != nil {
		tx.Rollback()
		return nil, types.NewErrFromGorm(err, "failed to create asset")
	}

	// Create AssetLocation records for each location
	for _, locationStr := range assetData.Locations {
		assetLocation := types.AssetLocation{
			AssetID:  asset.ID,
			Location: locationStr,
		}
		if err := tx.Create(&assetLocation).Error; err != nil {
			tx.Rollback()
			return nil, types.NewErrFromGorm(err, "failed to create asset location")
		}
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		return nil, types.NewErrFromGorm(err, "failed to commit transaction")
	}

	return &asset, nil
}

// retrieves all assets for a study
func (s *Service) StudyAssets(studyID uuid.UUID) ([]types.Asset, error) {
	assets := []types.Asset{}
	err := s.db.Preload("Locations").Where("study_id = ?", studyID).Find(&assets).Error
	return assets, types.NewErrFromGorm(err, "failed to get study assets")
}

// retrieves a specific asset within a study
func (s *Service) StudyAssetById(studyID uuid.UUID, assetID uuid.UUID) (types.Asset, error) {
	asset := types.Asset{}
	err := s.db.Preload("Locations").Where("study_id = ? AND id = ?", studyID, assetID).First(&asset).Error
	return asset, types.NewErrFromGorm(err, "failed to get study asset by id")
}

// retrieves all contracts for a specific asset within a study
func (s *Service) AssetContracts(studyID uuid.UUID, assetID uuid.UUID) ([]types.Contract, error) {
	contracts := []types.Contract{}
	err := s.db.Joins("left join assets on contracts.asset_id = assets.id").
		Where("assets.study_id = ? AND contracts.asset_id = ?", studyID, assetID).
		Order("created_at DESC").
		Find(&contracts).Error
	return contracts, types.NewErrFromGorm(err, "failed to get asset contracts")
}

func (s *Service) assetExists(studyID uuid.UUID, assetID uuid.UUID) (bool, error) {
	exists := false
	err := s.db.Model(&types.Asset{}).
		Select("count(*) > 0").
		Where("study_id = ? AND id = ?", studyID, assetID).
		Find(&exists).Error
	return exists, types.NewErrFromGorm(err, "failed check if asset exists")
}

func (s *Service) contractExists(studyID uuid.UUID, assetID uuid.UUID, contractID uuid.UUID) (bool, error) {
	exists := false
	err := s.db.Joins("left join assets on contracts.asset_id = assets.id").
		Model(&types.Contract{}).
		Select("count(*) > 0").
		Where("assets.study_id = ? AND contracts.asset_id = ? AND contracts.id = ?", studyID, assetID, contractID).
		Find(&exists).Error
	return exists, types.NewErrFromGorm(err, "failed check if contract exists")
}
