package rbac

import (
	"time"

	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm/clause"
)

// Initalise the RBAC enforcer
func Init() {
	log.Info().Msg("Seeding roles and admin users")
	enforcer := NewCasbinEnforcer()
	_ = must(enforcer.AddPolicy(string(Admin), "*", "*"))
	_ = must(enforcer.AddPolicy(string(Base), "/hello", "read"))
	for _, user := range persistedAdminUsers() {
		_ = must(AddRole(user, Admin))
	}
}

func persistedAdminUsers() []types.User {
	db := graceful.NewDB()
	users := []types.User{}
	for _, username := range config.AdminUsernames() {
		user := types.User{}
		result := db.Clauses(clause.OnConflict{DoNothing: true}).
			Where("username = ?", username).
			Attrs(types.User{
				Username: username,
				Model:    types.Model{CreatedAt: time.Now()},
			}).
			FirstOrCreate(&user)
		if result.RowsAffected > 0 {
			log.Info().Any("username", username).Msg("Created admin user")
		} else if result.RowsAffected == 0 {
			log.Info().Any("username", username).Msg("Found admin user")
		}
		users = append(users, user)
	}
	return users
}
