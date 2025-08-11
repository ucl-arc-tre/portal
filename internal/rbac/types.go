package rbac

import (
	"fmt"
	"strings"

	"github.com/google/uuid"
)

type RoleName string

type Action string

type Policy struct {
	RoleName RoleName
	Action   Action
	Resource string
}

type StudyRole struct {
	StudyID uuid.UUID
	Name    string
}

func (s StudyRole) RoleName() RoleName {
	return RoleName(fmt.Sprintf("study:%v:%v", s.StudyID, s.Name))
}

func makeStudyOwnerRole(studyId uuid.UUID) StudyRole {
	return StudyRole{StudyID: studyId, Name: "owner"}
}

func mustMakeStudyRole(role RoleName) StudyRole {
	parts := strings.Split(string(role), ":")
	if len(parts) != 3 || !isStudyRole(role) {
		panic("not a study role")
	}
	return StudyRole{StudyID: uuid.MustParse(parts[1]), Name: parts[2]}
}

func isStudyRole(role RoleName) bool {
	return strings.HasPrefix(string(role), "study")
}
