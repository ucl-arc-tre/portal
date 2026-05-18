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

func (s *Service) validateProjectTREData(projectTreData openapi.ProjectTRERequest, studyUUID uuid.UUID) error {
	if !validation.TREProjectNamePattern.MatchString(projectTreData.Name) {
		return types.NewErrClientInvalidObjectF("Project name must be 4-14 characters long and contain only lowercase letters and numbers")
	}

	if err := s.validateProjectNameUniqueness(projectTreData.Name); err != nil {
		return err
	}

	return s.validateProjectTREAssetsAndMembers(projectTreData.AssetIds, projectTreData.Members, studyUUID)
}

func (s *Service) validateProjectTREUpdate(projectUpdateData openapi.ProjectTREUpdate, projectTre *types.ProjectTRE) error {
	isIncomplete := projectTre.Status == types.ProjectTREStatusIncomplete
	isDeployed := projectTre.Status == types.ProjectTREStatusDeployed
	if !isIncomplete && !isDeployed {
		return types.NewErrInvalidObjectF("cannot update tre project with [%v] status", projectTre.Status)
	}

	return s.validateProjectTREAssetsAndMembers(projectUpdateData.AssetIds, projectUpdateData.Members, projectTre.Project.StudyID)
}

func (s *Service) validateProjectTREAssetsAndMembers(assetIds []string, members []openapi.ProjectTREMember, studyUUID uuid.UUID) error {
	// Validate assets belong to study and are compatible with TRE environment tier
	if len(assetIds) > 0 {
		// Get TRE environment tier
		var treEnvironment types.Environment
		err := s.db.Where("name = ?", environments.TRE).First(&treEnvironment).Error
		if err != nil {
			return types.NewErrFromGorm(err, "failed to fetch TRE environment")
		}

		if err := s.validateAssets(assetIds, studyUUID, treEnvironment.Tier); err != nil {
			return err
		}
	}

	// Validate members
	if len(members) > 0 {

		if err := s.validateProjectMembers(members); err != nil {
			return err
		}
	}

	return nil
}

func (s *Service) validateProjectNameUniqueness(projectName string) error {
	maxExpectedProjects := 0 // only one project with a given name should exist

	// Check if project name already exists
	var count int64
	err := s.db.Model(&types.Project{}).Where("LOWER(name) = LOWER(?)", projectName).Count(&count).Error
	if err != nil {
		return types.NewErrFromGorm(err, "failed to check for duplicate project name")
	}

	if count > int64(maxExpectedProjects) {
		return types.NewErrClientInvalidObjectF("A project with the name [%v] already exists", projectName)
	}

	return nil
}

func isValidProjectTRERole(role openapi.ProjectTRERoleName) bool {
	for _, validRole := range types.AllProjectTRERoles {
		if string(validRole) == string(role) {
			return true
		}
	}
	return false
}

func (s *Service) validateProjectMembers(members []openapi.ProjectTREMember) error {
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
			return err
		}

		isApprovedResearcher, err := rbac.HasRole(*user, rbac.ApprovedResearcher)
		if err != nil {
			return err
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
	if errorMessage != "" {
		return types.NewErrClientInvalidObjectF("invalid project members: %s", errorMessage)
	}
	return nil
}

func (s *Service) validateAssets(assetIDs []string, studyUUID uuid.UUID, environmentTier int) error {
	for _, assetIDStr := range assetIDs {
		assetUUID, err := uuid.Parse(assetIDStr)
		if err != nil {
			return types.NewErrClientInvalidObjectF("Invalid asset ID format: %v", assetIDStr)
		}

		var asset types.Asset
		err = s.db.Where("id = ?", assetUUID).First(&asset).Error
		if err != nil {
			if err == gorm.ErrRecordNotFound {
				return types.NewErrClientInvalidObjectF("Asset with ID [%v] does not exist", assetUUID)
			}
			return types.NewErrFromGorm(err, "failed to fetch asset")
		}

		if asset.StudyID != studyUUID {
			return types.NewErrClientInvalidObjectF("Asset [%v] does not belong to the specified study", asset.Title)
		}

		if asset.Tier > environmentTier {
			return types.NewErrClientInvalidObjectF("Asset [%v] has tier %d which is incompatible with environment (max tier %d)", asset.Title, asset.Tier, environmentTier)
		}
	}

	return nil
}

func (s *Service) CreateProjectTRE(ctx context.Context, creator types.User, studyUUID uuid.UUID, projectTreData openapi.ProjectTRERequest) error {

	if err := s.validateProjectTREData(projectTreData, studyUUID); err != nil {
		return err
	}

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
		Name:          projectTreData.Name,
		CreatorUserID: creator.ID,
		StudyID:       studyUUID,
		EnvironmentID: treEnvironment.ID,
	}

	if err := tx.Create(&project).Error; err != nil {
		tx.Rollback()
		return types.NewErrFromGorm(err, "failed to create project")
	}

	// Create ProjectTRE record
	projectTRE := types.ProjectTRE{
		ProjectID:                     project.ID,
		EgressNumberRequiredApprovals: 2, // TODO: this needs follow up UI/UX and backend validation work, need to discuss with the team
		Status:                        types.ProjectTREStatusIncomplete,
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
func (s *Service) ProjectsById(projectIds ...uuid.UUID) ([]GenericProject, error) {
	if len(projectIds) == 0 {
		return []GenericProject{}, nil
	}

	var projects []GenericProject
	err := s.genericProjectsQuery().Where("projects.id IN ? AND projects.deleted_at IS NULL", projectIds).Scan(&projects).Error

	return projects, types.NewErrFromGorm(err, "failed to retrieve projects")
}

// retrieves all projects (for admins and TRE ops staff)
func (s *Service) AllProjects() ([]GenericProject, error) {
	var projects []GenericProject
	err := s.genericProjectsQuery().Where("projects.deleted_at IS NULL").Scan(&projects).Error
	return projects, types.NewErrFromGorm(err, "failed to retrieve all projects")
}

func (s *Service) genericProjectsQuery() *gorm.DB {
	return s.db.Table("projects").
		Select(`
			projects.id,
	  		projects.study_id,
			projects.name,
			projects.created_at,
			projects.updated_at,
			users.username as creator_username,
			environments.name as environment_name,
			COALESCE(pt.status, '') as status
		`).Joins("join users on users.id = projects.creator_user_id").
		Joins("join environments on environments.id = projects.environment_id").
		Joins("left join project_tres pt on pt.project_id = projects.id")
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

func (s *Service) SubmitProjectTre(projectId uuid.UUID) error {
	result := s.db.Model(&types.ProjectTRE{}).
		Where("project_id = ?", projectId).
		Where("status = ?", types.ProjectTREStatusIncomplete).
		Update("status", types.ProjectTREStatusPendingApproval)

	if result.Error != nil {
		return types.NewErrFromGorm(result.Error, "failed to submit project")
	}

	if result.RowsAffected == 0 {
		return types.NewErrInvalidObjectF("project must be in Incomplete status to be submitted")
	}

	return nil
}

func (s *Service) ApproveProject(projectId uuid.UUID) error {
	result := s.db.Model(&types.ProjectTRE{}).
		Where("project_id = ?", projectId).
		Where("status = ?", types.ProjectTREStatusPendingApproval).
		Update("status", types.ProjectTREStatusPendingCreation)
	if result.RowsAffected == 0 {
		return types.NewErrInvalidObjectF("project must be in pending approval status to be approved")
	}
	return types.NewErrFromGorm(result.Error, "failed to approve project")
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
	if err := s.validateProjectTREUpdate(projectUpdateData, projectTRE); err != nil {
		return err
	}

	tx := s.db.Begin()
	defer graceful.RollbackTransactionOnPanic(tx)

	result := tx.Model(&types.ProjectTRE{}).
		Where("id = ?", projectTRE.ID).
		Update("status", types.ProjectTREStatusIncomplete)

	if err := result.Error; err != nil {
		tx.Rollback()
		return types.NewErrFromGorm(result.Error, "failed to update TRE project status")
	} else if result.RowsAffected == 0 {
		return types.NewErrInvalidObject("failed to find project TRE to update")
	}

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

	if projectTRE.Status != types.ProjectTREStatusIncomplete {
		tx.Rollback()
		return types.NewErrInvalidObjectF("deletion must have a incomplete status. was [%v]", projectTRE.Status)
	}

	// Soft delete all ProjectTRERoleBindings for this project
	err = tx.Where("project_tre_id = ?", projectTRE.ID).Delete(&types.ProjectTRERoleBinding{}).Error
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
