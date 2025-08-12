package rbac

import (
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestStudyRoleMarshal(t *testing.T) {
	id := uuid.MustParse("618880a8-bb0e-413d-9c02-689d86905466")
	studyRole := StudyRole{
		StudyID: id,
		Name:    "owner",
	}
	assert.Equal(t, studyRole, makeStudyOwnerRole(id))
	assert.Equal(t, "study_618880a8-bb0e-413d-9c02-689d86905466_owner", string(studyRole.RoleName()))
	assert.Equal(t, studyRole, mustMakeStudyRole(RoleName("study_618880a8-bb0e-413d-9c02-689d86905466_owner")))
}

func TestIsStudyRole(t *testing.T) {
	assert.True(t, isStudyRole(RoleName("study_xyz")))
	assert.False(t, isStudyRole(RoleName("thing_xyz")))
}
