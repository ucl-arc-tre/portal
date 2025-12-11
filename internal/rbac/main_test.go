package rbac

import (
	"testing"

	"github.com/casbin/casbin/v2"
	fileadapter "github.com/casbin/casbin/v2/persist/file-adapter"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/ucl-arc-tre/portal/internal/types"
)

var (
	adapter = fileadapter.NewAdapter("testdata/policy.csv")
)

func TestRBAC(t *testing.T) {
	enforcer = must(casbin.NewEnforcer(makeCasbinModel(), adapter))
	bob := makeUser("3843ed01-1cb0-4cc8-a2fc-3556cc8f393a")
	alice := makeUser("8ef0d19b-370c-40a6-a3ef-399dbebbbc8f")

	roles, err := Roles(bob)
	assert.NoError(t, err)
	assert.Equal(t, Admin, roles[0])
	assert.True(t, must(HasRole(bob, Admin)))
	assert.True(t, must(HasAnyRole(bob, Admin)))
	assert.True(t, must(HasAnyRole(bob, Admin, Base)))
	assert.False(t, must(HasAnyRole(bob, IGOpsStaff)))

	addedBaseRole, err := AddRole(bob, Base)
	assert.NoError(t, err)
	assert.True(t, addedBaseRole)
	assert.Len(t, must(Roles(bob)), 2)

	removedRole, err := RemoveRole(bob, Base)
	assert.NoError(t, err)
	assert.True(t, removedRole)
	assert.Len(t, must(Roles(bob)), 1)

	studyId := uuid.MustParse("ec4078c6-b886-449f-8cc8-2954308ccb0c")
	addedStudyRole, err := AddStudyOwnerRole(bob, studyId)
	assert.NoError(t, err)
	assert.True(t, addedStudyRole)
	bobStudyIDsWithOwnerRole, err := StudyIDsWithRole(bob, StudyOwner)
	assert.NoError(t, err)
	assert.Equal(t, studyId, bobStudyIDsWithOwnerRole[0])

	aliceStudyIDsWithOwnerRole, err := StudyIDsWithRole(alice, StudyOwner)
	assert.NoError(t, err)
	assert.Len(t, aliceStudyIDsWithOwnerRole, 0)
}

func makeUser(id string) types.User {
	return types.User{Model: types.Model{ID: uuid.MustParse(id)}}
}
