package rbac

import (
	"github.com/casbin/casbin/v2"
	"github.com/casbin/casbin/v2/model"
	"github.com/casbin/casbin/v2/util"
	gormadapter "github.com/casbin/gorm-adapter/v3"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
)

const (
	Admin              = RoleName(openapi.AuthRolesAdmin)              // Global admin on everything
	Base               = RoleName(openapi.AuthRolesBase)               // Most restricted role possible
	ApprovedResearcher = RoleName(openapi.AuthRolesApprovedResearcher) // Trained and attested user
	ReadAction         = Action("read")
	WriteAction        = Action("write")
)

var enforcer *casbin.Enforcer

// Get a casbin policy enforcer. Singleton is initalised if not already
func NewEnforcer() *casbin.Enforcer {
	if enforcer != nil {
		return enforcer
	}
	log.Debug().Msg("Creating casbin enforcer")
	model := must(model.NewModelFromString(casbinModel))
	adapter := must(gormadapter.NewAdapterByDB(graceful.NewDB()))
	enforcer = must(casbin.NewEnforcer(model, adapter))
	enforcer.EnableAutoSave(true) //  Auto persist a policy rule when it's added or removed
	enforcer.AddNamedMatchingFunc("g", "KeyMatch2", util.KeyMatch2)
	return enforcer
}

// Add a role for a user
func AddRole(user types.User, role RoleName) (bool, error) {
	roleAdded, err := enforcer.AddRoleForUser(user.ID.String(), string(role))
	return roleAdded, types.NewErrServerError(err)
}

// Get all roles of a user
func Roles(user types.User) ([]string, error) {
	roles, err := enforcer.GetRolesForUser(user.ID.String())
	return roles, types.NewErrServerError(err)
}

func HasRole(user types.User, role RoleName) (bool, error) {
	hasRole, err := enforcer.HasRoleForUser(user.ID.String(), string(role))
	return hasRole, types.NewErrServerError(err)
}

func must[T any](value T, err error) T {
	if err != nil {
		panic(err)
	} else {
		return value
	}
}

// See: https://casbin.org/docs/syntax-for-models and https://casbin.org/editor/
const casbinModel = `
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && keyMatch(r.obj, p.obj) && keyMatch(r.act, p.act)
`
