package entra

import (
	"strings"

	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/types"
)

type Email = string

type UserData struct {
	Email        *Email
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

type UserPrincipalName string

func (u UserPrincipalName) Username() types.Username {
	userPrincipalNameIsExternal := strings.Contains(string(u), "#EXT#")
	if userPrincipalNameIsExternal {
		parts := strings.Split(string(u), "#")
		if len(parts) != 3 || parts[1] != "EXT" {
			log.Error().Msg("unexpected number of parts for external UserPrincipalName")
			return types.Username(u)
		}
		email := replaceLastUnderscoreWithAtSymbol(parts[0])
		return types.Username(email)
	}
	return types.Username(u)
}
