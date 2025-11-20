package projects

import (
	"fmt"

	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

type Service struct {
	db *gorm.DB
}

func New() *Service {
	return &Service{db: graceful.NewDB()}
}

// ValidateRoleAssignment checks if a user meets the requirements for a role
// Example: To be a desktop user, you need to be an approved researcher (portal role)
func (s *Service) ValidateRoleAssignment(userID uuid.UUID, role types.ProjectTRERoleName) error {
	// Get the user to check portal-level roles
	var user types.User
	if err := s.db.First(&user, userID).Error; err != nil {
		return fmt.Errorf("user not found: %w", err)
	}

	// Role validation based on requirements
	switch role {
	case types.ProjectTREIngresser:
		// No requirements
		return nil

	case types.ProjectTREEgresser:
		// TODO: Define requirements for egresser
		return nil

	case types.ProjectTREDesktopUser:
		// Requires: Approved Researcher (portal role)
		hasRole, err := rbac.HasRole(user, rbac.ApprovedResearcher)
		if err != nil {
			return fmt.Errorf("failed to check approved researcher role: %w", err)
		}
		if !hasRole {
			return fmt.Errorf("user must be an approved researcher to be a desktop user")
		}
		return nil

	case types.ProjectTREEgressRequester, types.ProjectTREEgressChecker:
		// TODO: Requires Desktop User role (TRE role)
		return nil

	default:
		return fmt.Errorf("unknown role: %s", role)
	}
}
