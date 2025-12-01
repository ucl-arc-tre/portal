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
	if !validation.TREProjectNamePattern.MatchString(projectTreData.Name) {
		return &openapi.ValidationError{ErrorMessage: "Project name must start and end with a lowercase letter or number, and contain only lowercase letters, numbers, and hyphens"}, nil
	}

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

	// TODO: Validate environment exists and get environment for tier checking
	// TODO: Validate assets belong to study and are compatible with environment tier

	// only validate members if not in draft mode (Incomplete status)
	// if projectTreData.ApprovalStatus != "Incomplete" {
	// 	// TODO: Validate members exist and have required roles
	// 	// TODO: Validate role dependencies
	// }

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
