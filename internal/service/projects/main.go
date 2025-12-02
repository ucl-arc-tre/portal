package projects

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
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
	users *users.Service
}

func New() *Service {
	return &Service{
		db:    graceful.NewDB(),
		users: users.New(),
	}
}

func (s *Service) ValidateProjectTREData(ctx context.Context, projectTreData openapi.ProjectTRERequest, studyUUID uuid.UUID, creator types.User, isUpdate bool) (*openapi.ValidationError, error) {
	if !validation.TREProjectNamePattern.MatchString(projectTreData.Name) {
		return &openapi.ValidationError{ErrorMessage: "Project name must be 4-14 characters long and contain only lowercase letters and numbers"}, nil
	}

	// Note: No need to validate study exists - handler already checks user is study owner
	// Note: No need to validate environment exists - environment is determined by the endpoint (TRE in this case)

	validationError, err := s.validateProjectNameUniqueness(projectTreData.Name, isUpdate)
	if err != nil || validationError != nil {
		return validationError, err
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

	// only validate members if not in draft mode
	if !projectTreData.IsDraft {
		if projectTreData.Members != nil && len(*projectTreData.Members) > 0 {
			validationError, err := s.validateProjectMembers(*projectTreData.Members)
			if err != nil || validationError != nil {
				return validationError, err
			}
		}
	}

	return nil, nil
}

func (s *Service) validateProjectNameUniqueness(projectName string, isUpdate bool) (*openapi.ValidationError, error) {
	maxExpectedProjects := 0 // For new projects, expect zero existing projects with the same name
	if isUpdate {
		maxExpectedProjects = 1
	}

	// Check if project name already exists
	var count int64
	err := s.db.Model(&types.Project{}).Where("LOWER(name) = LOWER(?)", projectName).Count(&count).Error
	if err != nil {
		return nil, types.NewErrFromGorm(err, "failed to check for duplicate project name")
	}

	if count > int64(maxExpectedProjects) {
		return &openapi.ValidationError{ErrorMessage: fmt.Sprintf("A project with the name [%v] already exists", projectName)}, nil
	}

	return nil, nil
}

func isValidProjectTRERole(role openapi.ProjectTRERoleName) bool {
	for _, validRole := range types.AllProjectTRERoles {
		if string(validRole) == string(role) {
			return true
		}
	}
	return false
}

func (s *Service) validateProjectMembers(members []openapi.ProjectTREMember) (*openapi.ValidationError, error) {
	errorMessage := ""
	for _, member := range members {
		if len(member.Roles) == 0 {
			errorMessage += fmt.Sprintf("• User '%s' must have at least one role assigned\n\n", member.Username)
			continue
		}

		user, err := s.users.UserByUsername(types.Username(member.Username))
		if err != nil {
			if errors.Is(err, types.ErrNotFound) {
				errorMessage += fmt.Sprintf("• User '%s' not found. They must become an approved researcher before being added to a project\n\n", member.Username)
				continue
			}
			return nil, err
		}

		isApprovedResearcher, err := rbac.HasRole(*user, rbac.ApprovedResearcher)
		if err != nil {
			return nil, types.NewErrServerError(fmt.Errorf("failed to check approved researcher role for %s: %w", member.Username, err))
		}
		if !isApprovedResearcher {
			errorMessage += fmt.Sprintf("• User '%s' does not have the approved researcher role\n\n", member.Username)
		}

		for _, role := range member.Roles {
			if !isValidProjectTRERole(role) {
				errorMessage += fmt.Sprintf("• User '%s' has invalid role '%s'\n\n", member.Username, role)
			}
		}
	}
	if errorMessage == "" {
		return nil, nil
	}
	return &openapi.ValidationError{ErrorMessage: errorMessage}, nil
}

func (s *Service) validateAssets(assetIDs []string, studyUUID uuid.UUID, environmentTier int) (*openapi.ValidationError, error) {
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

		if asset.StudyID != studyUUID {
			return &openapi.ValidationError{ErrorMessage: fmt.Sprintf("Asset [%v] does not belong to the specified study", asset.Title)}, nil
		}

		if asset.Tier > environmentTier {
			return &openapi.ValidationError{ErrorMessage: fmt.Sprintf("Asset [%v] has tier %d which is incompatible with environment (max tier %d)", asset.Title, asset.Tier, environmentTier)}, nil
		}
	}

	return nil, nil
}

func (s *Service) createProjectTRERoleBindings(tx *gorm.DB, projectTREID uuid.UUID, members []openapi.ProjectTREMember) error {
	for _, member := range members {
		user, err := s.users.UserByUsername(types.Username(member.Username))
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
	// TODO: discuss how each project status should be set on creation
	approvalStatus := string(openapi.Incomplete)

	project := types.Project{
		Name:           projectTreData.Name,
		CreatorUserID:  creator.ID,
		StudyID:        studyUUID,
		ApprovalStatus: approvalStatus,
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
