package users

import (
	"slices"

	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func Init() {
	for _, roleName := range rbac.ConfigRoleNames {
		mustAddUsersWithRoleName(roleName)
	}
}

func mustAddUsersWithRoleName(roleName rbac.ConfigRolename) {
	service := New()
	usersWithRole := must(service.UsersWithConfigRole(roleName))
	for _, user := range usersWithRole {
		_ = must(rbac.AddRole(user, roleName))
	}

	// There may be users with the role assigned that no longer are in the config,
	// so remove them
	currentUserIdsWithRole := must(rbac.UserIdsWithRole(roleName))
	for _, userId := range currentUserIdsWithRole {
		if !slices.ContainsFunc(usersWithRole, func(u types.User) bool { return u.ID == userId }) {
			log.Info().Str("userId", userId.String()).Msg("User no longer had config role - removing")
			_ = must(rbac.RemoveRole(types.User{Model: types.Model{ID: userId}}, roleName))
		}
	}
}

func must[T any](value T, err error) T {
	if err != nil {
		panic(err)
	}
	return value
}
