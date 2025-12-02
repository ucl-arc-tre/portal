package graceful

import (
	"strings"
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

	for _, t := range models {
		if err := db.AutoMigrate(t); err != nil {
			panic(err)
		}
	}

	migrateDPNValues(db)

	log.Debug().Msg("Initalised database")
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

func migrateDPNValues(db *gorm.DB) {
	studies := []types.Study{}
	if err := db.Find(&studies).Error; err != nil {
		log.Err(err).Msg("Failed to migrate DPN values")
		return
	}
	for _, study := range studies {
		if study.DataProtectionNumber == nil {
			continue
		}
		dpn := strings.ReplaceAll(*study.DataProtectionNumber, "-", "/")
		err := db.Model(&study).Update("data_protection_number", dpn).Error
		if err != nil {
			log.Err(err).Msg("Failed to update data_protection_number")
		}
	}
}
