package entra

import "github.com/google/uuid"

type UserData struct {
	Email        *string
	EmployeeType *string
	Id           ObjectId
}

type ObjectId uuid.UUID

func (o ObjectId) String() string {
	return uuid.UUID(o).String()
}

type InvitedUserData struct {
	Id ObjectId
}
