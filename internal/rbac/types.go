package rbac

const (
	objectRoleDelimiter = "_" // NOTE: Cannot use :
)

type RoleName string

type Action string

type Policy struct {
	RoleName RoleName
	Action   Action
	Resource string
}
