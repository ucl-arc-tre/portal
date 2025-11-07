package rbac

import (
	"fmt"

	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/types"
)

// Helper function to add owner role for a resource with multiple API paths
func addOwnerRoleForResource(user types.User, roleName RoleName, apiPaths []string, resourceID uuid.UUID) (bool, error) {
	policies := []Policy{}

	for _, apiPath := range apiPaths {
		policies = append(policies,
			Policy{
				RoleName: roleName,
				Action:   "*",
				Resource: fmt.Sprintf("%s/%v", apiPath, resourceID),
			},
			Policy{
				RoleName: roleName,
				Action:   "*",
				Resource: fmt.Sprintf("%s/%v/*", apiPath, resourceID),
			},
		)
	}

	for _, policy := range policies {
		if _, err := addPolicy(enforcer, policy); err != nil {
			return false, err
		}
	}
	return AddRole(user, roleName)
}
