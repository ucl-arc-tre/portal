package projects

import (
	"fmt"

	"github.com/ucl-arc-tre/portal/internal/graceful"
	"github.com/ucl-arc-tre/portal/internal/types"
)

// Initialize the project roles
func Init() {
	roles := []types.ProjectRole{
		{
			Name:        types.ProjectRoleIngresser,
			Description: "Can upload data into the TRE",
		},
		{
			Name:        types.ProjectRoleEgresser,
			Description: "Can download data from the TRE",
		},
		{
			Name:        types.ProjectRoleEgressRequester,
			Description: "Can request data to be egressed from the TRE",
		},
		{
			Name:        types.ProjectRoleEgressChecker,
			Description: "Can approve egress requests",
		},
		{
			Name:        types.ProjectRoleDesktopUser,
			Description: "Can access a desktop environment in the TRE",
		},
	}

	db := graceful.NewDB()
	for _, role := range roles {
		result := db.Where(
			"name = ?",
			role.Name,
		).Attrs(types.ProjectRole{
			Name: role.Name,
		}).Assign(types.ProjectRole{
			Description: role.Description,
		}).FirstOrCreate(&types.ProjectRole{})

		if result.Error != nil {
			panic(fmt.Sprintf("failed to initialize project role: %v", result.Error))
		}
	}
}
