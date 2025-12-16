package rbac

import (
	"fmt"
	"slices"

	"github.com/casbin/casbin/v2"
	"github.com/casbin/casbin/v2/model"
	"github.com/casbin/casbin/v2/util"
	gormadapter "github.com/casbin/gorm-adapter/v3"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
)

const (
	Admin                         = RoleName(openapi.AuthRolesAdmin)                         // Global admin on everything
	Base                          = RoleName(openapi.AuthRolesBase)                          // Most restricted role possible
	Staff                         = RoleName(openapi.AuthRolesStaff)                         // Staff member at the institution
	ApprovedResearcher            = RoleName(openapi.AuthRolesApprovedResearcher)            // Trained and attested user
	ApprovedStaffResearcher       = RoleName(openapi.AuthRolesApprovedStaffResearcher)       // Member of staff at the institution thats also an approved researcher
	InformationAssetOwner         = RoleName(openapi.AuthRolesInformationAssetOwner)         // Has agreeed to the study owner agreement for at least one study
	InformationAssetAdministrator = RoleName(openapi.AuthRolesInformationAssetAdministrator) // Has agreeed to the study administrator agreement for at least one study
	TreOpsStaff                   = RoleName(openapi.AuthRolesTreOpsStaff)                   // Lesser admin role for tre ops staff
	IGOpsStaff                    = RoleName(openapi.AuthRolesIgOpsStaff)                    // Information governance operations staff

	ReadAction  = Action("read")
	WriteAction = Action("write")
)

var enforcer *casbin.Enforcer

// Get a casbin policy enforcer. Singleton is initalised if not already
func NewEnforcer() *casbin.Enforcer {
	if enforcer != nil {
		return enforcer
	}
	log.Debug().Msg("Creating casbin enforcer")
	adapter := must(gormadapter.NewAdapterByDB(graceful.NewDB()))
	enforcer = must(casbin.NewEnforcer(makeCasbinModel(), adapter))
	enforcer.EnableAutoSave(true) //  Auto persist a policy rule when it's added or removed
	enforcer.AddNamedMatchingFunc("g", "KeyMatch2", util.KeyMatch2)
	return enforcer
}

// Add a role for a user
func AddRole(user types.User, role RoleName) (bool, error) {
	roleAdded, err := enforcer.AddRoleForUser(user.ID.String(), string(role))
	return roleAdded, types.NewErrServerError(err)
}

// Add a child role to a parent role
func AddChildRole(parentRole RoleName, childRole RoleName) (bool, error) {
	roleAdded, err := enforcer.AddRoleForUser(string(parentRole), string(childRole))
	return roleAdded, types.NewErrServerError(err)
}

// Add a study role for a user
func AddStudyOwnerRole(user types.User, studyId uuid.UUID) (bool, error) {
	roleName := makeStudyOwnerRole(studyId).RoleName()
	policies := []Policy{
		{
			RoleName: roleName,
			Action:   "*",
			Resource: fmt.Sprintf("/studies/%v", studyId),
		},
		{
			RoleName: roleName,
			Action:   "*",
			Resource: fmt.Sprintf("/studies/%v/*", studyId),
		},
	}
	for _, policy := range policies {
		if _, err := addPolicy(enforcer, policy); err != nil {
			return false, err
		}
	}
	return AddRole(user, roleName)
}

// Study IDs where a user has a role
func StudyIDsWithRole(user types.User, studyRoleName StudyRoleName) ([]uuid.UUID, error) {
	roles, err := Roles(user)
	if err != nil {
		return []uuid.UUID{}, err
	}
	studyIDs := []uuid.UUID{}
	for _, role := range roles {
		if isStudyRole(role) {
			studyRole := mustMakeStudyRole(role)
			if studyRole.Name == studyRoleName {
				studyIDs = append(studyIDs, studyRole.StudyID)
			}
		}
	}
	return studyIDs, nil
}

// Add a project TRE owner role and add the role binding to
// the parent study role so study owners inherit a project owner role
func AddProjectTreOwnerRole(studyId uuid.UUID, projectId uuid.UUID) (bool, error) {
	projectOwnerRole := makeProjectOwnerRole(projectId)

	policy := Policy{
		RoleName: projectOwnerRole.RoleName(),
		Action:   "*",
		Resource: fmt.Sprintf("/projects/tre/%v", projectId),
	}
	if _, err := addPolicy(enforcer, policy); err != nil {
		return false, err
	}
	studyOwnerRole := makeStudyOwnerRole(studyId)
	return AddChildRole(studyOwnerRole.RoleName(), projectOwnerRole.RoleName())
}

// Project IDs where a user has a role
func ProjectIDsWithRole(user types.User, projectRoleName ProjectRoleName) ([]uuid.UUID, error) {
	roles, err := Roles(user)
	if err != nil {
		return []uuid.UUID{}, err
	}
	projectIDs := []uuid.UUID{}
	for _, role := range roles {
		if isProjectRole(role) {
			projectRole := mustMakeProjectRole(role)
			if projectRole.Name == projectRoleName {
				projectIDs = append(projectIDs, projectRole.ProjectID)
			}
		}
	}
	return projectIDs, nil
}

// Remove a role for a user
func RemoveRole(user types.User, role RoleName) (bool, error) {
	roleRemoved, err := enforcer.DeleteRoleForUser(user.ID.String(), string(role))
	return roleRemoved, types.NewErrServerError(err)
}

// Get all roles of a user
func Roles(user types.User) ([]RoleName, error) {
	rawRoles, err := enforcer.GetImplicitRolesForUser(user.ID.String())
	if err != nil {
		return []RoleName{}, err
	}
	roles := []RoleName{}
	for _, rawRole := range rawRoles {
		roles = append(roles, RoleName(rawRole))
	}
	return roles, types.NewErrServerError(err)
}

// Does the user have a role?
func HasRole(user types.User, role RoleName) (bool, error) {
	roles, err := Roles(user)
	if err != nil {
		return false, err
	}
	return slices.Contains(roles, role), nil
}

// Does the user have any of the listed roles
func HasAnyListedRole(user types.User, required ...RoleName) (bool, error) {
	roles, err := Roles(user)
	if err != nil {
		return false, err
	}
	for _, requiredRole := range required {
		if slices.Contains(roles, requiredRole) {
			return true, nil
		}
	}
	return false, nil
}

func userIdsWithRole(role RoleName) ([]uuid.UUID, error) {
	userIds, err := enforcer.GetUsersForRole(string(role))
	if err != nil {
		return nil, err
	}

	ids := []uuid.UUID{}
	for _, id := range userIds {
		uid := uuid.MustParse(id)
		ids = append(ids, uid)
	}

	return ids, types.NewErrServerError(err)
}

func makeCasbinModel() model.Model {
	return must(model.NewModelFromString(casbinModel))
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
