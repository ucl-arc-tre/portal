package rbac

import (
	"github.com/casbin/casbin/v3"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/graceful"
)

// Initialise the RBAC with roles and users
func Init() {
	log.Info().Msg("Seeding roles and static user role bindings")
	enforcer := NewEnforcer(graceful.NewDB())
	seedPolicies(enforcer)
}

func seedPolicies(enforcer *casbin.SyncedCachedEnforcer) {
	addBasePolicies(enforcer)
	addApprovedResearcherPolicies(enforcer)
	addAdminPolicy(enforcer)
	addTreOpsStaffPolicy(enforcer)
	addIgOpsStaffPolicy(enforcer)
	addIgAdminPolicy(enforcer)
	addDSHOpsStaffPolicy(enforcer)

	runMigrations()
}

func addBasePolicies(enforcer *casbin.SyncedCachedEnforcer) {
	policies := []Policy{
		{RoleName: Base, Resource: "/auth", Action: ReadAction},
		{RoleName: Base, Resource: "/notifications", Action: ReadAction},
		{RoleName: Base, Resource: "/notifications/:id/read", Action: WriteAction},
		{RoleName: Base, Resource: "/notifications/read", Action: WriteAction},
		{RoleName: Base, Resource: "/profile", Action: ReadAction},
		{RoleName: Base, Resource: "/profile", Action: WriteAction},
		{RoleName: Base, Resource: "/agreements/approved-researcher", Action: ReadAction},
		{RoleName: Base, Resource: "/profile/agreements", Action: ReadAction},
		{RoleName: Base, Resource: "/profile/agreements", Action: WriteAction},
		{RoleName: Base, Resource: "/profile/training", Action: ReadAction},
		{RoleName: Base, Resource: "/profile/training", Action: WriteAction},
		{RoleName: Base, Resource: "/projects", Action: ReadAction},
		{RoleName: Base, Resource: "/logout", Action: ReadAction},
		{RoleName: Base, Resource: "/feedback", Action: WriteAction},
	}
	for _, policy := range policies {
		mustAddPolicies(enforcer, policy)
	}
}

func addApprovedResearcherPolicies(enforcer *casbin.SyncedCachedEnforcer) {
	mustAddPolicies(enforcer,
		Policy{RoleName: ApprovedResearcher, Resource: "/studies", Action: ReadAction},
		Policy{RoleName: ApprovedStaffResearcher, Resource: "/studies", Action: WriteAction},
		Policy{RoleName: ApprovedStaffResearcher, Resource: "/agreements/study-owner", Action: ReadAction},
		Policy{RoleName: ApprovedStaffResearcher, Resource: "/agreements/study-administrator", Action: ReadAction},
		Policy{RoleName: InformationAssetOwner, Resource: "/users/invite", Action: WriteAction},
		Policy{RoleName: ApprovedStaffResearcher, Resource: "/users/lookup", Action: ReadAction},
		Policy{RoleName: ApprovedStaffResearcher, Resource: "/projects/tre", Action: ReadAction},
		Policy{RoleName: ApprovedStaffResearcher, Resource: "/projects/tre", Action: WriteAction},
		Policy{RoleName: ApprovedStaffResearcher, Resource: "/environments", Action: ReadAction},
	)
}

func addAdminPolicy(enforcer *casbin.SyncedCachedEnforcer) {
	mustAddPolicies(enforcer, Policy{RoleName: Admin, Resource: "*", Action: "*"})
}

func addTreOpsStaffPolicy(enforcer *casbin.SyncedCachedEnforcer) {
	mustAddPolicies(enforcer,
		Policy{RoleName: TreOpsStaff, Resource: "/users", Action: ReadAction},
		Policy{RoleName: TreOpsStaff, Resource: "/users/:id", Action: ReadAction},
		Policy{RoleName: TreOpsStaff, Resource: "/projects", Action: ReadAction},
		Policy{RoleName: TreOpsStaff, Resource: "/projects/tre/*", Action: ReadAction},
		Policy{RoleName: TreOpsStaff, Resource: "/projects/tre/admin/*", Action: WriteAction},
		Policy{RoleName: TreOpsStaff, Resource: "/tokens/tre", Action: ReadAction},
		Policy{RoleName: TreOpsStaff, Resource: "/tokens/tre", Action: WriteAction},
		Policy{RoleName: TreOpsStaff, Resource: "/tokens/tre/*", Action: ReadAction},
		Policy{RoleName: TreOpsStaff, Resource: "/tokens/tre/*", Action: WriteAction},
	)
}

func addIgOpsStaffPolicy(enforcer *casbin.SyncedCachedEnforcer) {
	mustAddPolicies(enforcer,
		Policy{RoleName: IGOpsStaff, Resource: "/users", Action: ReadAction},
		Policy{RoleName: IGOpsStaff, Resource: "/users/:id", Action: ReadAction},
		Policy{RoleName: IGOpsStaff, Resource: "/users/:id/training", Action: WriteAction},
		Policy{RoleName: IGOpsStaff, Resource: "/users/:id/attributes", Action: WriteAction},
		Policy{RoleName: IGOpsStaff, Resource: "/users/metrics", Action: ReadAction},
		Policy{RoleName: IGOpsStaff, Resource: "/users/invite", Action: WriteAction},

		Policy{RoleName: IGOpsStaff, Resource: "/studies", Action: ReadAction},
		Policy{RoleName: IGOpsStaff, Resource: "/studies/*", Action: ReadAction},
		Policy{RoleName: IGOpsStaff, Resource: "/studies/admin/*", Action: ReadAction},
		Policy{RoleName: IGOpsStaff, Resource: "/studies/admin/*", Action: WriteAction},
	)
}

func addIgAdminPolicy(enforcer *casbin.SyncedCachedEnforcer) {
	mustAddPolicies(enforcer,
		Policy{RoleName: IGAdmin, Resource: "/users", Action: ReadAction},
		Policy{RoleName: IGAdmin, Resource: "/users/:id", Action: ReadAction},
		Policy{RoleName: IGAdmin, Resource: "/users/:id/training", Action: WriteAction},
		Policy{RoleName: IGAdmin, Resource: "/users/:id/attributes", Action: WriteAction},
		Policy{RoleName: IGAdmin, Resource: "/users/metrics", Action: ReadAction},
		Policy{RoleName: IGAdmin, Resource: "/users/invite", Action: WriteAction},
		Policy{RoleName: IGAdmin, Resource: "/studies", Action: ReadAction},
		Policy{RoleName: IGAdmin, Resource: "/studies/*", Action: ReadAction},
		Policy{RoleName: IGAdmin, Resource: "/studies/*", Action: WriteAction},
	)
}

func addDSHOpsStaffPolicy(enforcer *casbin.SyncedCachedEnforcer) {
	mustAddPolicies(enforcer,
		Policy{RoleName: DSHOpsStaff, Resource: "/users", Action: ReadAction},
		Policy{RoleName: DSHOpsStaff, Resource: "/users/:id", Action: ReadAction},
		Policy{RoleName: DSHOpsStaff, Resource: "/tokens/dsh", Action: ReadAction},
		Policy{RoleName: DSHOpsStaff, Resource: "/tokens/dsh", Action: WriteAction},
		Policy{RoleName: DSHOpsStaff, Resource: "/tokens/dsh/*", Action: ReadAction},
		Policy{RoleName: DSHOpsStaff, Resource: "/tokens/dsh/*", Action: WriteAction},
	)
}

func mustAddPolicies(enforcer *casbin.SyncedCachedEnforcer, policies ...Policy) {
	for _, policy := range policies {
		_ = must(addPolicy(enforcer, policy))
	}
}

func addPolicy(enforcer *casbin.SyncedCachedEnforcer, policy Policy) (bool, error) {
	return enforcer.AddPolicy(string(policy.RoleName), policy.Resource, string(policy.Action))
}
