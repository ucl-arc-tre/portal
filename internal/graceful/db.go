package graceful

import (
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
		&types.Contract{},
		&types.UserSponsorship{},
		&types.Environment{},
	}
	db := NewDB()
	db.Exec(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`)

	// temporary migration of legal_basis data (remove once completed)
	migrateLegalBasisData(db)

	for _, t := range models {
		if err := db.AutoMigrate(t); err != nil {
			panic(err)
		}
	}
	log.Debug().Msg("Initalised database")
}

// migrate existing free text legal_basis values to enum values
func migrateLegalBasisData(db *gorm.DB) {
	log.Debug().Msg("Starting legal_basis data migration")

	// Update "A task in the public interest" to "public_task"
	result := db.Model(&types.Asset{}).
		Where("legal_basis = ?", "A task in the public interest").
		Update("legal_basis", "public_task")
	if result.Error != nil {
		log.Error().Err(result.Error).Msg("Failed to migrate legal_basis: 'A task in the public interest'")
	} else if result.RowsAffected > 0 {
		log.Info().Int64("rows", result.RowsAffected).Msg("Migrated legal_basis: 'A task in the public interest' -> 'public_task'")
	}

	// Update "Public task" to "public_task"
	result = db.Model(&types.Asset{}).
		Where("legal_basis = ?", "Public task").
		Update("legal_basis", "public_task")
	if result.Error != nil {
		log.Error().Err(result.Error).Msg("Failed to migrate legal_basis: 'Public task'")
	} else if result.RowsAffected > 0 {
		log.Info().Int64("rows", result.RowsAffected).Msg("Migrated legal_basis: 'Public task' -> 'public_task'")
	}

	log.Debug().Msg("Completed legal_basis data migration")
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
