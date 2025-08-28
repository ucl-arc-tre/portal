package studies

import (
	"context"
	"strings"

	"slices"

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
		return &openapi.AssetCreateValidationError{ErrorMessage: "classification_impact must be one of: Public, Confidential, Highly confidential"}, nil
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
		openapi.AssetBaseProtectionIdentifiableLowConfidencePseudonymisation,
	}
	if !slices.Contains(validProtections, assetData.Protection) {
		return &openapi.AssetCreateValidationError{ErrorMessage: "protection must be one of: anonymisation, identifiable_low_confidence_pseudonymisation"}, nil
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
		return &openapi.AssetCreateValidationError{ErrorMessage: "format must be one of: Electronic, Paper, Other"}, nil
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
		return &openapi.AssetCreateValidationError{ErrorMessage: "status must be one of: Active, Awaiting, Destroyed"}, nil
	}

	// Validate third_party_agreement when accessed_by_third_parties is true
	if assetData.AccessedByThirdParties && strings.TrimSpace(assetData.ThirdPartyAgreement) == "" {
		return &openapi.AssetCreateValidationError{ErrorMessage: "third_party_agreement is required when accessed_by_third_parties is true"}, nil
	}

	// Check if the Asset title already exists
	// var count int64
	// err := s.db.Model(&types.Asset{}).Where("title = ?", assetData.Title).Count(&count).Error
	// if err != nil {
	// 	return nil, types.NewErrServerError(fmt.Errorf("failed to check for duplicate asset title: %w", err))
	// }
	// if count > 0 {
	// 	return &openapi.AssetCreateValidationError{ErrorMessage: fmt.Sprintf("an asset with the title [%v] already exists", assetData.Title)}, nil
	// }

	return nil, nil
}

func (s *Service) CreateAsset(ctx context.Context, user types.User, AssetData openapi.AssetBase, studyID string) (*openapi.AssetCreateValidationError, error) {
	log.Info().Msg("Creating asset")

	validationError, err := s.validateAssetData(AssetData)
	if err != nil || validationError != nil {
		return validationError, err
	}

	// AssetLocation, err := s.createAssetLocation(AssetData)
	// if err != nil {
	// 	return nil, err
	// }

	// Asset, err := s.createAsset(AssetData, AssetLocation)
	// if err != nil {
	// 	return nil, err
	// }
	// if _, err := rbac.AddAssetOwnerRole(owner, Asset.ID); err != nil {
	// 	return nil, err
	// }

	return nil, nil
}
