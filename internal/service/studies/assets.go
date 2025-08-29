package studies

import (
	"context"
	"fmt"
	"strings"

	"slices"

	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func (s *Service) validateAssetData(assetData openapi.AssetBase) (*openapi.AssetCreateValidationError, error) {
	// Validate title
	if strings.TrimSpace(assetData.Title) == "" {
		return &openapi.AssetCreateValidationError{ErrorMessage: "asset title is required"}, nil
	}
	if !titlePattern.MatchString(assetData.Title) {
		return &openapi.AssetCreateValidationError{ErrorMessage: "asset title must be 4-50 characters, start and end with a letter/number, and contain only letters, numbers, spaces, and hyphens"}, nil
	}

	// Validate description
	if strings.TrimSpace(assetData.Description) == "" {
		return &openapi.AssetCreateValidationError{ErrorMessage: "asset description is required"}, nil
	}
	if len(strings.TrimSpace(assetData.Description)) < 4 || len(assetData.Description) > 255 {
		return &openapi.AssetCreateValidationError{ErrorMessage: "asset description must be 4-255 characters"}, nil
	}

	// Validate classification_impact
	if strings.TrimSpace(string(assetData.ClassificationImpact)) == "" {
		return &openapi.AssetCreateValidationError{ErrorMessage: "classification_impact is required"}, nil
	}
	validClassifications := []openapi.AssetBaseClassificationImpact{
		openapi.AssetBaseClassificationImpactPublic,
		openapi.AssetBaseClassificationImpactConfidential,
		openapi.AssetBaseClassificationImpactHighlyConfidential,
	}
	if !slices.Contains(validClassifications, assetData.ClassificationImpact) {
		return &openapi.AssetCreateValidationError{ErrorMessage: "classification_impact must be one of: public, confidential, highly_confidential"}, nil
	}

	// Validate locations
	if len(assetData.Locations) == 0 {
		return &openapi.AssetCreateValidationError{ErrorMessage: "at least one location must be specified"}, nil
	}

	// Validate protection field
	if strings.TrimSpace(string(assetData.Protection)) == "" {
		return &openapi.AssetCreateValidationError{ErrorMessage: "protection is required"}, nil
	}
	validProtections := []openapi.AssetBaseProtection{
		openapi.AssetBaseProtectionAnonymisation,
		openapi.AssetBaseProtectionPseudonymisation,
		openapi.AssetBaseProtectionIdentifiableLowConfidencePseudonymisation,
	}
	if !slices.Contains(validProtections, assetData.Protection) {
		return &openapi.AssetCreateValidationError{ErrorMessage: "protection must be one of: anonymisation, pseudonymisation, identifiable_low_confidence_pseudonymisation"}, nil
	}

	// Validate legal_basis
	if strings.TrimSpace(assetData.LegalBasis) == "" {
		return &openapi.AssetCreateValidationError{ErrorMessage: "legal_basis is required"}, nil
	}

	// Validate format field
	if strings.TrimSpace(string(assetData.Format)) == "" {
		return &openapi.AssetCreateValidationError{ErrorMessage: "format is required"}, nil
	}
	validFormats := []openapi.AssetBaseFormat{
		openapi.AssetBaseFormatElectronic,
		openapi.AssetBaseFormatPaper,
		openapi.AssetBaseFormatOther,
	}
	if !slices.Contains(validFormats, assetData.Format) {
		return &openapi.AssetCreateValidationError{ErrorMessage: "format must be one of: electronic, paper, other"}, nil
	}

	// Validate expiry field
	if strings.TrimSpace(assetData.Expiry) == "" {
		return &openapi.AssetCreateValidationError{ErrorMessage: "expiry date is required"}, nil
	}

	// Validate status field
	if strings.TrimSpace(string(assetData.Status)) == "" {
		return &openapi.AssetCreateValidationError{ErrorMessage: "status is required"}, nil
	}
	validStatuses := []openapi.AssetBaseStatus{
		openapi.AssetBaseStatusActive,
		openapi.AssetBaseStatusAwaiting,
		openapi.AssetBaseStatusDestroyed,
	}
	if !slices.Contains(validStatuses, assetData.Status) {
		return &openapi.AssetCreateValidationError{ErrorMessage: "status must be one of: active, awaiting, destroyed"}, nil
	}

	// Validate third_party_agreement when accessed_by_third_parties is true
	if assetData.AccessedByThirdParties && strings.TrimSpace(assetData.ThirdPartyAgreement) == "" {
		return &openapi.AssetCreateValidationError{ErrorMessage: "third_party_agreement is required when accessed_by_third_parties is true"}, nil
	}

	return nil, nil
}

func (s *Service) CreateAsset(ctx context.Context, user types.User, assetData openapi.AssetBase, studyID uuid.UUID) (*openapi.AssetCreateValidationError, error) {
	log.Debug().Any("studyID", studyID).Any("user", user).Msg("Creating asset")

	validationError, err := s.validateAssetData(assetData)
	if err != nil || validationError != nil {
		return validationError, err
	}

	_, err = s.createStudyAsset(user, assetData, studyID)
	if err != nil {
		return nil, err
	}

	return nil, nil
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

	// Create the Asset with proper fields from AssetBase
	asset := types.Asset{
		CreatorUserID:          user.ID,
		StudyID:                studyID,
		Title:                  assetData.Title,
		Description:            assetData.Description,
		ClassificationImpact:   string(assetData.ClassificationImpact),
		Protection:             string(assetData.Protection),
		LegalBasis:             assetData.LegalBasis,
		Format:                 string(assetData.Format),
		Expiry:                 assetData.Expiry,
		HasDspt:                assetData.HasDspt,
		StoredOutsideUkEea:     assetData.StoredOutsideUkEea,
		AccessedByThirdParties: assetData.AccessedByThirdParties,
		ThirdPartyAgreement:    assetData.ThirdPartyAgreement,
		Status:                 string(assetData.Status),
	}

	// Create the asset
	if err := tx.Create(&asset).Error; err != nil {
		tx.Rollback()
		return nil, types.NewErrServerError(fmt.Errorf("failed to create asset: %w", err))
	}

	// Create AssetLocation records for each location
	for _, locationStr := range assetData.Locations {
		assetLocation := types.AssetLocation{
			AssetID:  asset.ID,
			Location: locationStr,
		}
		if err := tx.Create(&assetLocation).Error; err != nil {
			tx.Rollback()
			return nil, types.NewErrServerError(fmt.Errorf("failed to create asset location: %w", err))
		}
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		return nil, types.NewErrServerError(fmt.Errorf("failed to commit transaction: %w", err))
	}

	return &asset, nil
}
