package rbac

import (
	"fmt"
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
	addTreOpsStaffPolicy(enforcer)

	addUserRoleBindings(config.AdminUsernames(), Admin)
	addUserRoleBindings(config.TreOpsStaffUsernames(), TreOpsStaff)
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
		{RoleName: ApprovedResearcher, Resource: "/projects/*", Action: ReadAction},
		{RoleName: ApprovedStaffResearcher, Resource: "/projects/*", Action: WriteAction},
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

func addUserRoleBindings(usernames []types.Username, role RoleName) {
	removeOutdatedPersistedUserRoleBindings(usernames, role)
	for _, user := range persistedUsers(usernames) {
		_ = must(AddRole(user, role))
	}
}

func persistedUsers(usernames []types.Username) []types.User {
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

func removeOutdatedPersistedUserRoleBindings(usernames []types.Username, role RoleName) {
	db := graceful.NewDB()
	outdatedUsers := []types.User{}

	userIdsWithRole, err := userIdsWithRole(role)
	if err != nil {
		panic(fmt.Sprintf("failed to get user ids from role [%v]", err))
	}
	if len(usernames) > 0 {
		err = db.Where("id IN (?)", userIdsWithRole).Not("username IN (?)", usernames).Find(&outdatedUsers).Error
	} else {
		err = db.Where("id IN (?)", userIdsWithRole).Find(&outdatedUsers).Error
	}
	if err != nil {
		panic(fmt.Sprintf("failed to get users with roles [%v]", err))
	}
	log.Debug().Any("outdatedUsers", outdatedUsers).Any("role", role).Msg("Users who are not in config")

	// remove role bindings for outdated users
	for _, user := range outdatedUsers {
		_, err := RemoveRole(user, role)
		if err != nil {
			panic(fmt.Sprintf("failed to remove role for user [%v]", err))
		}
	}

}
