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
	addAdminPolicy(enforcer)
	addAdminUserRoleBindings()
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
	}
	for _, policy := range policies {
		addPolicy(enforcer, policy)
	}
}

func addAdminPolicy(enforcer *casbin.Enforcer) {
	addPolicy(enforcer, Policy{RoleName: Admin, Resource: "*", Action: "*"})
}

func addPolicy(enforcer *casbin.Enforcer, policy Policy) {
	_ = must(enforcer.AddPolicy(string(policy.RoleName), policy.Resource, string(policy.Action)))
}

func addAdminUserRoleBindings() {
	for _, user := range persistedAdminUsers() {
		_ = must(AddRole(user, Admin))
	}
}

func persistedAdminUsers() []types.User {
	db := graceful.NewDB()
	users := []types.User{}
	for _, username := range config.AdminUsernames() {
		user := types.User{}
		result := db.Clauses(clause.OnConflict{DoNothing: true}).
			Where("username = ?", username).
			Attrs(types.User{
				Username: username,
				Model:    types.Model{CreatedAt: time.Now()},
			}).
			FirstOrCreate(&user)
		if result.RowsAffected > 0 {
			log.Info().Any("username", username).Msg("Created admin user")
		} else if result.RowsAffected == 0 {
			log.Info().Any("username", username).Msg("Found admin user")
		}
		users = append(users, user)
	}
	return users
}
