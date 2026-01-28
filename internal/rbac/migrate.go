package rbac

import (
	"github.com/rs/zerolog/log"
)

func runMigrations() {
	// db := graceful.NewDB()
	log.Debug().Msg("Migrated RBAC")
	// todo - create issue to remove rbac migrations
}
