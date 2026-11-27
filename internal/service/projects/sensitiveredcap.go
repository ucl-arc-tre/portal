package projects

import (
	"maps"
	"slices"

	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/service/audit"
	"github.com/ucl-arc-tre/portal/internal/service/environments"
	"github.com/ucl-arc-tre/portal/internal/types"
	"github.com/ucl-arc-tre/portal/internal/validation"
	"gorm.io/gorm"
)

func (s *Service) redcapTier3Query() *gorm.DB {
	return s.db.Model(&types.ProjectSensitiveRedcap{}).
		Where("project_id IN (?)", s.db.Model(&types.Project{}).Select("id")).
		Preload("ProjectsTRE").Preload("ProjectsDSH").Preload("Project.Study.Owner").Preload("Project.Environment").Preload("Project.ProjectAssets.Asset")
}

func (s *Service) ProjectRedcapTier3ById(projectId uuid.UUID) (*types.ProjectSensitiveRedcap, error) {
	project := types.ProjectSensitiveRedcap{}
	err := s.redcapTier3Query().Where("project_id = ?", projectId).First(&project).Error
	return &project, types.NewErrFromGorm(err, "failed to retrieve REDCap tier 3 project")
}

func (s *Service) AllProjectsRedcapTier3() ([]types.ProjectSensitiveRedcap, error) {
	projects := []types.ProjectSensitiveRedcap{}
	err := s.redcapTier3Query().Order("created_at DESC").Find(&projects).Error
	return projects, types.NewErrFromGorm(err, "failed to retrieve REDCap tier 3 projects")
}

func (s *Service) ProjectsRedcapTier3ByIds(projectIds ...uuid.UUID) ([]types.ProjectSensitiveRedcap, error) {
	projects := []types.ProjectSensitiveRedcap{}
	if len(projectIds) == 0 {
		return projects, nil
	}
	err := s.redcapTier3Query().Where("project_id IN ?", projectIds).Order("created_at DESC").Find(&projects).Error
	return projects, types.NewErrFromGorm(err, "failed to retrieve REDCap tier 3 projects")
}

func (s *Service) CreateProjectRedcapTier3(creator types.User, studyId uuid.UUID, data openapi.ProjectSensitiveREDCapRequest) error {
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

	linkableProjects, err := s.accessibleRedcapLinkProjects(creator)
	if err != nil {
		tx.Rollback()
		return err
	}
	treIDs, err := validateRedcapLinkIDs(data.ProjectTreIds, linkableProjects, environments.TRE)
	if err != nil {
		tx.Rollback()
		return err
	}
	dshIDs, err := validateRedcapLinkIDs(data.ProjectDshIds, linkableProjects, environments.DSH)
	if err != nil {
		tx.Rollback()
		return err
	}
	var treProjects []types.ProjectTRE
	var dshProjects []types.ProjectDSH
	if len(treIDs) > 0 {
		if err := tx.Where("project_id IN ?", treIDs).Find(&treProjects).Error; err != nil {
			tx.Rollback()
			return types.NewErrFromGorm(err, "failed to load linked TRE projects")
		}
	}
	if len(dshIDs) > 0 {
		if err := tx.Where("project_id IN ?", dshIDs).Find(&dshProjects).Error; err != nil {
			tx.Rollback()
			return types.NewErrFromGorm(err, "failed to load linked DSH projects")
		}
	}
	if len(treProjects) != len(treIDs) || len(dshProjects) != len(dshIDs) {
		tx.Rollback()
		return types.NewErrClientInvalidObject("linked project is unavailable")
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
	redcapProject := types.ProjectSensitiveRedcap{
		ProjectID:   project.ID,
		Description: data.Description,
		ProjectsTRE: treProjects,
		ProjectsDSH: dshProjects,
	}
	if err := tx.Omit("ProjectsTRE.*", "ProjectsDSH.*").Create(&redcapProject).Error; err != nil {
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

func (s *Service) accessibleRedcapLinkProjects(user types.User) ([]GenericProject, error) {
	ids, err := rbac.ProjectIDsWithRole(user, rbac.ProjectOwner)
	if err != nil {
		return nil, err
	}
	return s.Projects(QueryParams{}, []types.EnvironmentName{}, ids...)
}

func validateRedcapLinkIDs(requested []string, accessible []GenericProject, environment types.EnvironmentName) ([]uuid.UUID, error) {
	allowed := map[uuid.UUID]bool{}
	for _, project := range accessible {
		if project.EnvironmentName == string(environment) {
			allowed[project.ID] = true
		}
	}
	ids := map[uuid.UUID]bool{}
	for _, value := range requested {
		id, err := uuid.Parse(value)
		if err != nil || !allowed[id] {
			return nil, types.NewErrClientInvalidObject("linked project is unavailable or not accessible")
		}
		ids[id] = true
	}
	return slices.Collect(maps.Keys(ids)), nil
}
