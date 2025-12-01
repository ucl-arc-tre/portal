package projects

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
	"github.com/ucl-arc-tre/portal/internal/validation"
	"gorm.io/gorm"
)

type Service struct {
	db *gorm.DB
}

func New() *Service {
	return &Service{db: graceful.NewDB()}
}

func (s *Service) ValidateProjectTREData(ctx context.Context, projectTreData openapi.ProjectTRERequest, studyUUID uuid.UUID, isUpdate bool) (*openapi.ValidationError, error) {
	// Validate project name format
	if !validation.TREProjectNamePattern.MatchString(projectTreData.Name) {
		return &openapi.ValidationError{ErrorMessage: "Project name must start and end with a lowercase letter or number, and contain only lowercase letters, numbers, and hyphens"}, nil
	}

	// Note: No need to validate study exists - handler already checks user is study owner
	// Note: No need to validate environment exists - environment is determined by the endpoint (TRE in this case)

	maxExpectedProjects := 0 // For new projects, expect zero existing projects with the same name
	if isUpdate {
		maxExpectedProjects = 1
	}

	// Check if project name already exists
	var count int64
	err := s.db.Model(&types.Project{}).Where("LOWER(name) = LOWER(?)", projectTreData.Name).Count(&count).Error
	if err != nil {
		return nil, types.NewErrFromGorm(err, "failed to check for duplicate project name")
	}
	if count > int64(maxExpectedProjects) {
		return &openapi.ValidationError{ErrorMessage: fmt.Sprintf("A project with the name [%v] already exists", projectTreData.Name)}, nil
	}

	// Validate assets belong to study and are compatible with TRE environment tier
	if projectTreData.AssetIds != nil && len(*projectTreData.AssetIds) > 0 {
		// Get TRE environment tier
		var treEnvironment types.Environment
		err = s.db.Where("name = ?", "ARC Trusted Research Environment").First(&treEnvironment).Error
		if err != nil {
			return nil, types.NewErrFromGorm(err, "failed to fetch TRE environment")
		}

		validationError, err := s.validateAssets(*projectTreData.AssetIds, studyUUID, treEnvironment.Tier)
		if err != nil || validationError != nil {
			return validationError, err
		}
	}

	// only validate members if not in draft mode (Incomplete status)
	// if projectTreData.ApprovalStatus != "Incomplete" {
	// 	// TODO: Validate members exist and have required roles
	// 	// TODO: Validate role dependencies
	// }

	return nil, nil
}

func (s *Service) validateAssets(assetIDs []string, studyUUID uuid.UUID, environmentTier int) (*openapi.ValidationError, error) {
	// Parse and validate each asset
	for _, assetIDStr := range assetIDs {
		assetUUID, err := uuid.Parse(assetIDStr)
		if err != nil {
			return &openapi.ValidationError{ErrorMessage: fmt.Sprintf("Invalid asset ID format: %v", assetIDStr)}, nil
		}

		var asset types.Asset
		err = s.db.Where("id = ?", assetUUID).First(&asset).Error
		if err != nil {
			if err == gorm.ErrRecordNotFound {
				return &openapi.ValidationError{ErrorMessage: fmt.Sprintf("Asset with ID [%v] does not exist", assetUUID)}, nil
			}
			return nil, types.NewErrFromGorm(err, "failed to fetch asset")
		}

		// Validate asset belongs to the study
		if asset.StudyID != studyUUID {
			return &openapi.ValidationError{ErrorMessage: fmt.Sprintf("Asset [%v] does not belong to the specified study", asset.Title)}, nil
		}

		// Validate asset tier is compatible with environment tier
		if asset.Tier > environmentTier {
			return &openapi.ValidationError{ErrorMessage: fmt.Sprintf("Asset [%v] has tier %d which is incompatible with environment (max tier %d)", asset.Title, asset.Tier, environmentTier)}, nil
		}
	}

	return nil, nil
}

func (s *Service) CreateProjectTRE(ctx context.Context, creator types.User, studyUUID uuid.UUID, projectTreData openapi.ProjectTRERequest) error {
	// TODO: Create project in transaction:
	// - Create Project record
	// - Create ProjectTRE record
	// - Create ProjectTRERoleBinding records for each member+role
	// - Add RBAC roles for project members

	return nil
}
