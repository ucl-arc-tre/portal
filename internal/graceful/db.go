package graceful

import (
	"fmt"
	"time"

	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

const (
	initConnectRetryDelay = 1 * time.Second
)

// Initialise the database and migrate required types
func InitDB() {
	models := []any{
		&types.User{},
		&types.Agreement{},
		&types.UserAgreementConfirmation{},
		&types.UserTrainingRecord{},
		&types.UserAttributes{},
		&types.Study{},
		&types.StudyAdmin{},
		&types.StudyAgreementSignature{},
		&types.Asset{},
		&types.AssetLocation{},
		&types.UserSponsorship{},
	}
	db := NewDB()
	db.Exec(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`)

	migrateAssetTable(db)

	for _, t := range models {
		if err := db.AutoMigrate(t); err != nil {
			panic(err)
		}
	}
}

// run the custom migration for the Asset table schema changes
func migrateAssetTable(db *gorm.DB) {
	log.Debug().Msg("Starting custom migration")

	if db.Migrator().HasTable(&types.Asset{}) {
		log.Debug().Msg("Starting custom Asset table migration")

		// Drop columns
		if db.Migrator().HasColumn(&types.Asset{}, "expiry") {
			if err := db.Migrator().DropColumn(&types.Asset{}, "expiry"); err != nil {
				panic(fmt.Sprintf("Failed to drop expiry column: %v", err))
			}
		}
		if db.Migrator().HasColumn(&types.Asset{}, "accessed_by_third_parties") {
			if err := db.Migrator().DropColumn(&types.Asset{}, "accessed_by_third_parties"); err != nil {
				panic(fmt.Sprintf("Failed to drop accessed_by_third_parties column: %v", err))
			}
		}
		if db.Migrator().HasColumn(&types.Asset{}, "third_party_agreement") {
			if err := db.Migrator().DropColumn(&types.Asset{}, "third_party_agreement"); err != nil {
				panic(fmt.Sprintf("Failed to drop third_party_agreement column: %v", err))
			}
		}
	}
}

// Create a new gorm DB, blocking until a connection is made
func NewDB() *gorm.DB {
	connectRetryDelay := initConnectRetryDelay
	for {
		db, err := gorm.Open(postgres.New(postgres.Config{
			DSN:                  config.DBDataSourceName(),
			PreferSimpleProtocol: true,
		}), &gorm.Config{})
		if err == nil {
			return db
		} else {
			log.Debug().Msg("Waiting for DB connection...")
			time.Sleep(connectRetryDelay)
			connectRetryDelay *= 2
		}
	}
}
