package rbac

const (
	objectRoleDelimiter = "_" // NOTE: Cannot use :
)

type Action string

type RoleName string

type ConfigRolename = RoleName // assigned by config rather than dynamically at runtime

type Policy struct {
	RoleName RoleName
	Action   Action
	Resource string
}
