package rbac

import (
	"fmt"
	"strings"

	"github.com/google/uuid"
)

const (
	projectPrefix = "project"
	ProjectOwner  = ProjectRoleName("owner")
)

type ProjectRoleName string

type ProjectRole struct {
	ProjectID uuid.UUID
	Name      ProjectRoleName
}

func (p ProjectRole) RoleName() RoleName {
	return RoleName(fmt.Sprintf("%s%s%v%s%v", projectPrefix, objectRoleDelimiter, p.ProjectID, objectRoleDelimiter, p.Name))
}

func makeProjectOwnerRole(projectId uuid.UUID) ProjectRole {
	return ProjectRole{ProjectID: projectId, Name: ProjectOwner}
}

func mustMakeProjectRole(role RoleName) ProjectRole {
	parts := strings.Split(string(role), objectRoleDelimiter)
	if len(parts) != 3 || parts[0] != projectPrefix {
		panic("not a project role")
	}
	return ProjectRole{ProjectID: uuid.MustParse(parts[1]), Name: ProjectRoleName(parts[2])}
}

func isProjectRole(role RoleName) bool {
	return strings.HasPrefix(string(role), projectPrefix)
}
