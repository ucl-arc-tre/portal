package entra

import (
	"strings"

	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/types"
)

type UserData struct {
	Email        *string
	EmployeeType *string
	Id           *string
}

type UserPrincipalName string

func (u UserPrincipalName) Username() types.Username {
	userPrincipalNameIsExternal := strings.Contains(string(u), "#")
	if userPrincipalNameIsExternal {
		parts := strings.Split(string(u), "#")
		if len(parts) != 3 || parts[1] != "EXT" {
			log.Error().Msg("unexpected number of parts for external UserPrincipalName")
			return types.Username(u)
		}
		return types.Username(parts[0])
	}
	return types.Username(u)
}
