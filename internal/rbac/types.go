package rbac

import (
	"fmt"
	"strings"

	"github.com/google/uuid"
)

const (
	studyPrefix = "study_" // NOTE: Cannot use a : delimter with type prefix
	StudyOwner  = StudyRoleName("owner")
)

type RoleName string

type StudyRoleName string

type Action string

type Policy struct {
	RoleName RoleName
	Action   Action
	Resource string
}

type StudyRole struct {
	StudyID uuid.UUID
	Name    StudyRoleName
}

func (s StudyRole) RoleName() RoleName {
	return RoleName(fmt.Sprintf("%s%v_%v", studyPrefix, s.StudyID, s.Name))
}

func makeStudyOwnerRole(studyId uuid.UUID) StudyRole {
	return StudyRole{StudyID: studyId, Name: StudyOwner}
}

func mustMakeStudyRole(role RoleName) StudyRole {
	parts := strings.Split(strings.Replace(string(role), studyPrefix, "", 1), ":")
	if len(parts) != 2 {
		panic("not a study role")
	}
	return StudyRole{StudyID: uuid.MustParse(parts[0]), Name: StudyRoleName(parts[1])}
}

func isStudyRole(role RoleName) bool {
	return strings.HasPrefix(string(role), studyPrefix)
}
