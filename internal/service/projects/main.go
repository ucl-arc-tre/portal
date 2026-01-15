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

func (s *Service) ValidateProjectTREData(projectTreData openapi.ProjectTRERequest, studyUUID uuid.UUID) (*openapi.ValidationError, error) {
	if !validation.TREProjectNamePattern.MatchString(projectTreData.Name) {
		return &openapi.ValidationError{ErrorMessage: "Project name must be 4-14 characters long and contain only lowercase letters and numbers"}, nil
	}

	validationError, err := s.validateProjectNameUniqueness(projectTreData.Name)
	if err != nil || validationError != nil {
		return validationError, err
	}

	return s.validateProjectTREAssetsAndMembers(projectTreData.AssetIds, projectTreData.Members, studyUUID)
}

func (s *Service) ValidateProjectTREUpdate(projectUpdateData openapi.ProjectTREUpdate, studyUUID uuid.UUID) (*openapi.ValidationError, error) {
	return s.validateProjectTREAssetsAndMembers(projectUpdateData.AssetIds, projectUpdateData.Members, studyUUID)
}

func (s *Service) validateProjectTREAssetsAndMembers(assetIds []string, members []openapi.ProjectTREMember, studyUUID uuid.UUID) (*openapi.ValidationError, error) {
	// Validate assets belong to study and are compatible with TRE environment tier
	if len(assetIds) > 0 {
		// Get TRE environment tier
		var treEnvironment types.Environment
		err := s.db.Where("name = ?", environments.TRE).First(&treEnvironment).Error
		if err != nil {
			return nil, types.NewErrFromGorm(err, "failed to fetch TRE environment")
		}

		validationError, err := s.validateAssets(assetIds, studyUUID, treEnvironment.Tier)
		if err != nil || validationError != nil {
			return validationError, err
		}
	}

	// Validate members
	if len(members) > 0 {
		validationError, err := s.validateProjectMembers(members)
		if err != nil || validationError != nil {
			return validationError, err
		}
	}

	return nil, nil
}

func (s *Service) validateProjectNameUniqueness(projectName string) (*openapi.ValidationError, error) {
	maxExpectedProjects := 0 // only one project with a given name should exist

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

func (s *Service) CreateProjectTRE(ctx context.Context, creator types.User, studyUUID uuid.UUID, projectTreData openapi.ProjectTRERequest) error {
	// Get TRE environment
	var treEnvironment types.Environment
	err := s.db.Where("name = ?", environments.TRE).First(&treEnvironment).Error
	if err != nil {
		return types.NewErrFromGorm(err, "failed to fetch TRE environment")
	}

	// Start a transaction
	tx := s.db.Begin()
	defer graceful.RollbackTransactionOnPanic(tx)

	// Create Project record
	project := types.Project{
		Name:           projectTreData.Name,
		CreatorUserID:  creator.ID,
		StudyID:        studyUUID,
		EnvironmentID:  treEnvironment.ID,
		ApprovalStatus: string(openapi.Incomplete),
	}

	if err := tx.Create(&project).Error; err != nil {
		tx.Rollback()
		return types.NewErrFromGorm(err, "failed to create project")
	}

	// Create ProjectTRE record
	projectTRE := types.ProjectTRE{
		ProjectID:                     project.ID,
		EgressNumberRequiredApprovals: 2, // TODO: this needs follow up UI/UX and backend validation work, need to discuss with the team
	}

	if err := tx.Create(&projectTRE).Error; err != nil {
		tx.Rollback()
		return types.NewErrFromGorm(err, "failed to create project TRE")
	}

	if err := s.createOrUpdateProjectAssets(tx, project.ID, projectTreData); err != nil {
		tx.Rollback()
		return err
	}

	// Create ProjectTRERoleBinding records for each member+role
	if err := s.createOrUpdateProjectTRERoleBindings(tx, projectTRE.ID, projectTreData.Members); err != nil {
		tx.Rollback()
		return err
	}

	if _, err := rbac.AddProjectTreOwnerRole(studyUUID, project.ID); err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Commit().Error; err != nil {
		return types.NewErrFromGorm(err, "failed to commit create project transaction")
	}

	return nil
}

// retrieves projects by their IDs
func (s *Service) ProjectsById(projectIds ...uuid.UUID) ([]types.Project, error) {
	if len(projectIds) == 0 {
		return []types.Project{}, nil
	}

	var projects []types.Project
	err := s.db.
		Preload("CreatorUser").
		Preload("Environment").
		Where("id IN ?", projectIds).
		Find(&projects).Error

	return projects, types.NewErrFromGorm(err, "failed to retrieve projects")
}

// retrieves all projects (for admins and TRE ops staff)
func (s *Service) AllProjects() ([]types.Project, error) {
	var projects []types.Project
	err := s.db.
		Preload("CreatorUser").
		Preload("Environment").
		Find(&projects).Error

	return projects, types.NewErrFromGorm(err, "failed to retrieve all projects")
}

// retrieves a single TRE project by ID with all related data
func (s *Service) ProjectTreById(projectId uuid.UUID) (*types.ProjectTRE, error) {
	var projectTRE types.ProjectTRE
	err := s.db.
		Preload("Project.CreatorUser").
		Preload("Project.Environment").
		Preload("Project.Study").
		Preload("Project.ProjectAssets.Asset").
		Preload("TRERoleBindings.User").
		Where("project_id = ?", projectId).
		First(&projectTRE).Error

	if err != nil {
		return nil, types.NewErrFromGorm(err, "failed to retrieve project TRE data")
	}

	return &projectTRE, nil
}

func (s *Service) SubmitProject(projectId uuid.UUID) error {
	result := s.db.Model(&types.Project{}).
		Where("id = ?", projectId).
		Where("approval_status = ?", openapi.Incomplete).
		Update("approval_status", openapi.Pending)

	if result.Error != nil {
		return types.NewErrFromGorm(result.Error, "failed to submit project")
	}

	if result.RowsAffected == 0 {
		return types.NewErrInvalidObject(fmt.Errorf("project must be in Incomplete status to be submitted"))
	}

	return nil
}

func (s *Service) ApproveProject(projectId uuid.UUID) error {
	err := s.db.Model(&types.Project{}).
		Where("id = ?", projectId).
		Update("approval_status", openapi.Approved).Error

	if err != nil {
		return types.NewErrFromGorm(err, "failed to approve project")
	}

	return nil
}

func (s *Service) createOrUpdateProjectAssets(tx *gorm.DB, projectUUID uuid.UUID, project openapi.ProjectWithAssets) error {
	requestedAssetIDs, err := project.AssetUUIDs()
	if err != nil {
		return err
	}

	// Get all existing project assets (including soft-deleted)
	existingProjectAssets := []types.ProjectAsset{}
	if err := tx.Unscoped().Where("project_id = ?", projectUUID).Find(&existingProjectAssets).Error; err != nil {
		return types.NewErrFromGorm(err, "failed to list project assets")
	}

	requestedAssets := []types.ProjectAsset{}
	for _, assetId := range requestedAssetIDs {
		requestedAssets = append(requestedAssets, types.ProjectAsset{
			ProjectID: projectUUID,
			AssetID:   assetId,
		})
	}

	return graceful.UpdateManyExisting(tx, existingProjectAssets, requestedAssets)
}

func (s *Service) createOrUpdateProjectTRERoleBindings(tx *gorm.DB, projectTREID uuid.UUID, members []openapi.ProjectTREMember) error {
	// Get all existing role bindings (including soft-deleted)
	existingBindings := []types.ProjectTRERoleBinding{}
	if err := tx.Unscoped().Where("project_tre_id = ?", projectTREID).Find(&existingBindings).Error; err != nil {
		return types.NewErrFromGorm(err, "failed to list role bindings")
	}

	userIds, err := s.users.UserIds(treProjectMemberUsernames(members)...)
	if err != nil {
		return err
	}

	requestedBindings := []types.ProjectTRERoleBinding{}
	for _, member := range members {
		for _, role := range member.Roles {
			roleBinding := types.ProjectTRERoleBinding{
				ProjectTREID: projectTREID,
				UserID:       userIds[types.Username(member.Username)],
				Role:         types.ProjectTRERoleName(role),
			}
			requestedBindings = append(requestedBindings, roleBinding)
		}
	}

	return graceful.UpdateManyExisting(tx, existingBindings, requestedBindings)
}

func (s *Service) UpdateProjectTRE(projectTRE *types.ProjectTRE, projectUpdateData openapi.ProjectTREUpdate) error {
	tx := s.db.Begin()
	defer graceful.RollbackTransactionOnPanic(tx)

	if err := s.createOrUpdateProjectAssets(tx, projectTRE.ProjectID, projectUpdateData); err != nil {
		tx.Rollback()
		return err
	}

	if err := s.createOrUpdateProjectTRERoleBindings(tx, projectTRE.ID, projectUpdateData.Members); err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Commit().Error; err != nil {
		return types.NewErrFromGorm(err, "failed to commit update project transaction")
	}

	return nil
}

func (s *Service) DeleteProjectTRE(projectId uuid.UUID) error {
	tx := s.db.Begin()
	defer graceful.RollbackTransactionOnPanic(tx)

	// Retrieve the ProjectTRE
	var projectTRE types.ProjectTRE
	err := tx.Where("project_id = ?", projectId).First(&projectTRE).Error
	if err != nil {
		tx.Rollback()
		return types.NewErrFromGorm(err, "failed to find project TRE")
	}

	// Soft delete all ProjectTRERoleBindings for this project
	err = tx.Where("project_tre_id = ?", 123).Delete(&types.ProjectTRERoleBinding{}).Error
	if err != nil {
		tx.Rollback()
		return types.NewErrFromGorm(err, "failed to delete project TRE role bindings")
	}

	// Soft delete all ProjectAssets for this project
	err = tx.Where("project_id = ?", projectId).Delete(&types.ProjectAsset{}).Error
	if err != nil {
		tx.Rollback()
		return types.NewErrFromGorm(err, "failed to delete project assets")
	}

	// Soft delete the ProjectTRE record
	err = tx.Delete(&projectTRE).Error
	if err != nil {
		tx.Rollback()
		return types.NewErrFromGorm(err, "failed to delete project TRE")
	}

	// Soft delete the base Project record
	err = tx.Where("id = ?", projectId).Delete(&types.Project{}).Error
	if err != nil {
		tx.Rollback()
		return types.NewErrFromGorm(err, "failed to delete project")
	}

	if err := tx.Commit().Error; err != nil {
		return types.NewErrFromGorm(err, "failed to commit delete project transaction")
	}

	return nil
}

func treProjectMemberUsernames(members []openapi.ProjectTREMember) []types.Username {
	usernames := []types.Username{}
	for _, member := range members {
		usernames = append(usernames, types.Username(member.Username))
	}
	return usernames
}
