package rbac

import (
	"time"

	"github.com/casbin/casbin/v2"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm/clause"
)

// Initalise the RBAC with roles and users
func Init() {
	log.Info().Msg("Seeding roles and admin users")
	enforcer := NewEnforcer()
	addBasePolicies(enforcer)
	addApprovedResearcherPolicies(enforcer)
	addAdminPolicy(enforcer)
	addAdminUserRoleBindings()
	addTreOpsStaffPolicy(enforcer)
	addTreOpsStaffUserRoleBindings()
}

func addBasePolicies(enforcer *casbin.Enforcer) {
	policies := []Policy{
		{RoleName: Base, Resource: "/auth", Action: ReadAction},
		{RoleName: Base, Resource: "/profile", Action: ReadAction},
		{RoleName: Base, Resource: "/profile", Action: WriteAction},
		{RoleName: Base, Resource: "/agreements/approved-researcher", Action: ReadAction},
		{RoleName: Base, Resource: "/profile/agreements", Action: ReadAction},
		{RoleName: Base, Resource: "/profile/agreements", Action: WriteAction},
		{RoleName: Base, Resource: "/profile/training", Action: ReadAction},
		{RoleName: Base, Resource: "/profile/training", Action: WriteAction},
		{RoleName: Base, Resource: "/logout", Action: ReadAction},
	}
	for _, policy := range policies {
		mustAddPolicy(enforcer, policy)
	}
}

func addApprovedResearcherPolicies(enforcer *casbin.Enforcer) {
	policies := []Policy{
		{RoleName: ApprovedResearcher, Resource: "/studies", Action: ReadAction},
		{RoleName: ApprovedStaffResearcher, Resource: "/studies", Action: WriteAction},
		{RoleName: ApprovedStaffResearcher, Resource: "/agreements/study-owner", Action: ReadAction},
		{RoleName: InformationAssetOwner, Resource: "/users/invite", Action: WriteAction},
	}
	for _, policy := range policies {
		mustAddPolicy(enforcer, policy)
	}
}

func addAdminPolicy(enforcer *casbin.Enforcer) {
	mustAddPolicy(enforcer, Policy{RoleName: Admin, Resource: "*", Action: "*"})
}

func addTreOpsStaffPolicy(enforcer *casbin.Enforcer) {
	mustAddPolicy(enforcer, Policy{RoleName: TreOpsStaff, Resource: "*", Action: ReadAction})
}

func mustAddPolicy(enforcer *casbin.Enforcer, policy Policy) {
	_ = must(addPolicy(enforcer, policy))
}

func addPolicy(enforcer *casbin.Enforcer, policy Policy) (bool, error) {
	return enforcer.AddPolicy(string(policy.RoleName), policy.Resource, string(policy.Action))
}

func addAdminUserRoleBindings() {
	for _, user := range persistedAdminUsers() {
		_ = must(AddRole(user, Admin))
	}
}

func addTreOpsStaffUserRoleBindings() {
	for _, user := range persistedTreOpsStaffUsers() {
		_ = must(AddRole(user, TreOpsStaff))
	}
}

func persistedAdminUsers() []types.User {
	users := persistedUsersFromConfig(config.AdminUsernames())

	return users
}

func persistedTreOpsStaffUsers() []types.User {
	users := persistedUsersFromConfig(config.TreOpsStaffUsernames())

	return users
}

func persistedUsersFromConfig(usernames []types.Username) []types.User {
	db := graceful.NewDB()
	users := []types.User{}
	for _, username := range usernames {
		user := types.User{}
		result := db.Clauses(clause.OnConflict{DoNothing: true}).
			Where("username = ?", username).
			Attrs(types.User{
				Username: username,
				Model:    types.Model{CreatedAt: time.Now()},
			}).
			FirstOrCreate(&user)
		if result.RowsAffected > 0 {
		} else if result.RowsAffected == 0 {
		}
		users = append(users, user)
	}
	return users
}
