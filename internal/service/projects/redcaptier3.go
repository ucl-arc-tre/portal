package projects

import (
	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/service/audit"
	"github.com/ucl-arc-tre/portal/internal/types"
	"github.com/ucl-arc-tre/portal/internal/validation"
	"gorm.io/gorm"
)

func (s *Service) redcapTier3Query() *gorm.DB {
	return s.db.Model(&types.ProjectRedcapTier3{}).
		Where("project_id IN (?)", s.db.Model(&types.Project{}).Select("id")).
		Preload("Project.Study.Owner").Preload("Project.Environment").Preload("Project.ProjectAssets.Asset")
}

func (s *Service) ProjectRedcapTier3ById(projectId uuid.UUID) (*types.ProjectRedcapTier3, error) {
	project := types.ProjectRedcapTier3{}
	err := s.redcapTier3Query().Where("project_id = ?", projectId).First(&project).Error
	return &project, types.NewErrFromGorm(err, "failed to retrieve REDCap tier 3 project")
}

func (s *Service) AllProjectsRedcapTier3() ([]types.ProjectRedcapTier3, error) {
	projects := []types.ProjectRedcapTier3{}
	err := s.redcapTier3Query().Order("created_at DESC").Find(&projects).Error
	return projects, types.NewErrFromGorm(err, "failed to retrieve REDCap tier 3 projects")
}

func (s *Service) ProjectsRedcapTier3ByIds(projectIds ...uuid.UUID) ([]types.ProjectRedcapTier3, error) {
	projects := []types.ProjectRedcapTier3{}
	if len(projectIds) == 0 {
		return projects, nil
	}
	err := s.redcapTier3Query().Where("project_id IN ?", projectIds).Order("created_at DESC").Find(&projects).Error
	return projects, types.NewErrFromGorm(err, "failed to retrieve REDCap tier 3 projects")
}

func (s *Service) CreateProjectRedcapTier3(creator types.User, studyId uuid.UUID, data openapi.ProjectRedcapTier3Request) error {
	if !validation.RedcapTier3ProjectNamePattern.MatchString(data.Name) {
		return types.NewErrClientInvalidObject("Project name must be 4-14 characters long and contain only lowercase letters and numbers")
	}
	if err := s.validateProjectNameUniqueness(data.Name); err != nil {
		return err
	}
	environment, err := s.environments.SensitiveRedcap()
	if err != nil {
		return err
	}
	if err := s.validateAssets(data.AssetIds, studyId, environment.Tier); err != nil {
		return err
	}
	tx := s.db.Begin()
	defer graceful.RollbackTransactionOnPanic(tx)
	if err := tx.Error; err != nil {
		return types.NewErrFromGorm(err, "failed to begin create project transaction")
	}

	var study types.Study
	if err := tx.First(&study, "id = ?", studyId).Error; err != nil {
		tx.Rollback()
		return types.NewErrFromGorm(err, "failed to fetch study")
	}
	project := types.Project{
		Name:          data.Name,
		CreatorUserID: creator.ID,
		StudyID:       study.ID,
		EnvironmentID: environment.ID,
	}
	if err := tx.Create(&project).Error; err != nil {
		tx.Rollback()
		return types.NewErrFromGorm(err, "failed to create project")
	}
	redcapProject := types.ProjectRedcapTier3{ProjectID: project.ID}
	if err := tx.Create(&redcapProject).Error; err != nil {
		tx.Rollback()
		return types.NewErrFromGorm(err, "failed to create REDCap tier 3 project")
	}
	if err := s.createOrUpdateProjectAssets(tx, project.ID, data); err != nil {
		tx.Rollback()
		return err
	}
	if err := audit.LogProjectCreation(tx, creator, project); err != nil {
		tx.Rollback()
		return err
	}
	if _, err := rbac.AddProjectRedcapTier3OwnerRole(study.ID, project.ID); err != nil {
		tx.Rollback()
		return err
	}
	return types.NewErrFromGorm(tx.Commit().Error, "failed to commit create project transaction")
}
