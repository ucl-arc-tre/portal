package projects

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/controller/entra"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/service/environments"
	"github.com/ucl-arc-tre/portal/internal/service/users"
	"github.com/ucl-arc-tre/portal/internal/types"
	"github.com/ucl-arc-tre/portal/internal/validation"
	"gorm.io/gorm"
)

type Service struct {
	db    *gorm.DB
	entra *entra.Controller
	users *users.Service
}

func New() *Service {
	return &Service{
		db:    graceful.NewDB(),
		entra: entra.New(),
		users: users.New(),
	}
}

func (s *Service) ValidateProjectTREData(ctx context.Context, projectTreData openapi.ProjectTRERequest, studyUUID uuid.UUID, creator types.User, isUpdate bool) (*openapi.ValidationError, error) {
	// Validate project name format
	if !validation.TREProjectNamePattern.MatchString(projectTreData.Name) {
		return &openapi.ValidationError{ErrorMessage: "Project name must be 4-14 characters long and contain only lowercase letters and numbers"}, nil
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
		err = s.db.Where("name = ?", environments.TRE).First(&treEnvironment).Error
		if err != nil {
			return nil, types.NewErrFromGorm(err, "failed to fetch TRE environment")
		}

		validationError, err := s.validateAssets(*projectTreData.AssetIds, studyUUID, treEnvironment.Tier)
		if err != nil || validationError != nil {
			return validationError, err
		}
	}

	// only validate members if not in draft mode (Incomplete status)
	if projectTreData.ApprovalStatus != openapi.Incomplete {
		if projectTreData.Members != nil && len(*projectTreData.Members) > 0 {
			validationError, err := s.validateProjectMembers(ctx, *projectTreData.Members, creator.Username)
			if err != nil || validationError != nil {
				return validationError, err
			}
		}
	}

	return nil, nil
}

func (s *Service) validateProjectMembers(ctx context.Context, members []openapi.ProjectTREMember, creatorUsername types.Username) (*openapi.ValidationError, error) {
	errorMessage := ""
	for _, member := range members {
		// Validate member has at least one role
		if len(member.Roles) == 0 {
			errorMessage += fmt.Sprintf("• User '%s' must have at least one role assigned\n\n", member.Username)
			continue
		}

		// Validate that the creator is not adding themselves as a member
		// TODO: check if this is actually needed, or if it is actually valid to add yourself as a member
		if types.Username(member.Username) == creatorUsername {
			errorMessage += "• You cannot add yourself as a project member (you are already the project creator)\n\n"
			continue
		}

		// Get user from database to check if they exist and get their User struct for RBAC checks
		user, err := s.users.PersistedUser(types.Username(member.Username))
		if err != nil {
			return nil, err
		}

		// Check if user is a staff member
		isStaff, err := s.entra.IsStaffMember(ctx, types.Username(member.Username))
		if errors.Is(err, types.ErrNotFound) {
			errorMessage += fmt.Sprintf("• User '%s' not found in directory\n\n", member.Username)
			continue
		} else if err != nil {
			return nil, types.NewErrServerError(fmt.Errorf("failed to validate employee status for %s: %w", member.Username, err))
		} else if !isStaff {
			errorMessage += fmt.Sprintf("• User '%s' is not a staff member\n\n", member.Username)
			continue
		}

		// Check if user has approved researcher role
		isApprovedResearcher, err := rbac.HasRole(user, rbac.ApprovedResearcher)
		if err != nil {
			return nil, types.NewErrServerError(fmt.Errorf("failed to check approved researcher role for %s: %w", member.Username, err))
		}
		if !isApprovedResearcher {
			errorMessage += fmt.Sprintf("• User '%s' does not have the approved researcher role\n\n", member.Username)
		}
	}
	if errorMessage == "" {
		return nil, nil
	}
	return &openapi.ValidationError{ErrorMessage: errorMessage}, nil
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

func (s *Service) createProjectTRERoleBindings(tx *gorm.DB, projectTREID uuid.UUID, members []openapi.ProjectTREMember) error {
	for _, member := range members {
		// Get user from database
		user, err := s.users.PersistedUser(types.Username(member.Username))
		if err != nil {
			return err
		}

		// Create a role binding for each role assigned to this member
		for _, role := range member.Roles {
			roleBinding := types.ProjectTRERoleBinding{
				ProjectTREID: projectTREID,
				UserID:       user.ID,
				Role:         types.ProjectTRERoleName(role),
			}

			if err := tx.Create(&roleBinding).Error; err != nil {
				return types.NewErrFromGorm(err, fmt.Sprintf("failed to create role binding for user %s", member.Username))
			}
		}
	}
	return nil
}

func (s *Service) CreateProjectTRE(ctx context.Context, creator types.User, studyUUID uuid.UUID, projectTreData openapi.ProjectTRERequest) error {
	// Get TRE environment
	var treEnvironment types.Environment
	err := s.db.Where("name = ?", environments.TRE).First(&treEnvironment).Error
	if err != nil {
		return types.NewErrFromGorm(err, "failed to fetch TRE environment")
	}

	// Start a transaction
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Create Project record
	project := types.Project{
		Name:           projectTreData.Name,
		CreatorUserID:  creator.ID,
		StudyID:        studyUUID,
		ApprovalStatus: string(projectTreData.ApprovalStatus),
	}

	if err := tx.Create(&project).Error; err != nil {
		tx.Rollback()
		return types.NewErrFromGorm(err, "failed to create project")
	}

	// Create ProjectTRE record
	projectTRE := types.ProjectTRE{
		ProjectID:                     project.ID,
		EnvironmentID:                 treEnvironment.ID,
		EgressNumberRequiredApprovals: 1, // TODO: discuss with team if this should be configurable
	}

	if err := tx.Create(&projectTRE).Error; err != nil {
		tx.Rollback()
		return types.NewErrFromGorm(err, "failed to create project TRE")
	}

	// Create ProjectAsset records for each asset
	if projectTreData.AssetIds != nil {
		for _, assetIDStr := range *projectTreData.AssetIds {
			assetUUID, err := uuid.Parse(assetIDStr)
			if err != nil {
				tx.Rollback()
				return types.NewErrInvalidObject(fmt.Errorf("invalid asset ID format: %s", assetIDStr))
			}

			projectAsset := types.ProjectAsset{
				ProjectID: project.ID,
				AssetID:   assetUUID,
			}

			if err := tx.Create(&projectAsset).Error; err != nil {
				tx.Rollback()
				return types.NewErrFromGorm(err, "failed to create project asset")
			}
		}
	}

	if projectTreData.Members != nil {
		if err := s.createProjectTRERoleBindings(tx, projectTRE.ID, *projectTreData.Members); err != nil {
			tx.Rollback()
			return err
		}
	}

	if err := tx.Commit().Error; err != nil {
		return types.NewErrFromGorm(err, "failed to commit create project transaction")
	}

	if _, err := rbac.AddProjectTreOwnerRole(creator, project.ID); err != nil {
		return err
	}

	return nil
}
