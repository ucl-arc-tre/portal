package rbac

import (
	"fmt"
	"strings"

	"github.com/google/uuid"
)

const (
	studyPrefix = "study"
	StudyOwner  = StudyRoleName("owner")
)

type StudyRoleName string

type StudyRole struct {
	StudyID uuid.UUID
	Name    StudyRoleName
}

func (s StudyRole) RoleName() RoleName {
	return RoleName(fmt.Sprintf("%s%s%v%s%v", studyPrefix, objectRoleDelimiter, s.StudyID, objectRoleDelimiter, s.Name))
}

func makeStudyOwnerRole(studyId uuid.UUID) StudyRole {
	return StudyRole{StudyID: studyId, Name: StudyOwner}
}

func mustMakeStudyRole(role RoleName) StudyRole {
	parts := strings.Split(string(role), objectRoleDelimiter)
	if len(parts) != 3 || parts[0] != studyPrefix {
		panic("not a study role")
	}
	return StudyRole{StudyID: uuid.MustParse(parts[1]), Name: StudyRoleName(parts[2])}
}

func isStudyRole(role RoleName) bool {
	return strings.HasPrefix(string(role), studyPrefix)
}
