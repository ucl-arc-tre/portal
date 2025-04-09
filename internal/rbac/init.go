package rbac

import (
	"time"

	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	"github.com/ucl-arc-tre/portal/internal/types"
)

// Initalise the RBAC enforcer
func Init() {
	log.Info().Msg("Seeding roles and admin users")
	enforcer := NewCasbinEnforcer()
	_ = must(enforcer.AddPolicy(adminRoleName, "*", "*"))
	for _, user := range persistedAdminUsers() {
		_ = must(enforcer.AddRoleForUser(user.ID.String(), adminRoleName))
	}
}

func persistedAdminUsers() []types.User {
	db := graceful.NewDB()
	users := []types.User{}
	for _, username := range config.AdminUsernames() {
		user := types.User{
			Username: username,
			Model: types.Model{
				ID:        uuid.New(),
				CreatedAt: time.Now(),
			},
		}
		result := db.Where("username = ?", username).FirstOrCreate(&user)
		if result.Error != nil {
			panic(result.Error)
		} else if result.RowsAffected > 0 {
			log.Info().Str("username", username).Msg("Found admin user")
		} else if result.RowsAffected == 0 {
			log.Info().Str("username", username).Msg("Created admin user")
		}
		users = append(users, user)
	}
	return users
}
