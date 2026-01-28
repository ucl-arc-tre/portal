package graceful

import (
	"slices"
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
		&types.Project{},
		&types.ProjectTRE{},
		&types.ProjectTRERoleBinding{},
		&types.ProjectAsset{},
	}
	db := NewDB()
	db.Exec(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`)

	for _, t := range models {
		if err := db.AutoMigrate(t); err != nil {
			panic(err)
		}
	}

	migrateDPNValues(db)
	migrateContracts(db)

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

func migrateContracts(db *gorm.DB) {
	// migration from asset-bound contracts to study-bound contracts

	contract := types.Contract{}
	migrator := db.Migrator()

	if migrator.HasConstraint(&contract, "contracts_asset_id_fkey") {
		err := migrator.DropConstraint("contracts", "contracts_asset_id_fkey")
		if err != nil {
			log.Err(err).Msg("failed to drop asset foreign key constraint on 'contracts' table")
		}
	}

	if migrator.HasColumn(&contract, "asset_id") {
		err := migrator.DropColumn(&contract, "asset_id")
		if err != nil {
			log.Err(err).Msg("failed to drop 'asset_id' field from 'contracts' table")
		}
	}

	if migrator.HasIndex(&contract, "contracts_asset_id_index") {
		err := migrator.DropIndex(&contract, "contracts_asset_id_index")
		if err != nil {
			log.Err(err).Msg("failed to drop index on 'contracts' table")
		}
	}

}

type UpdateObject interface {
	UniqueKey() string
	IsDeleted() bool
}

// Update an existing list of many ojects to their new values using
// unique keys that can only exist once in the database.
func UpdateManyExisting[T UpdateObject](tx *gorm.DB, old []T, new []T) error {
	newKeys := []string{}
	for _, n := range new {
		newKeys = append(newKeys, n.UniqueKey())
	}
	for _, o := range old {
		inNew := slices.Contains(newKeys, o.UniqueKey())
		if !inNew && !o.IsDeleted() { // needs deleting
			if err := tx.Delete(&o).Error; err != nil {
				return types.NewErrFromGorm(err, "failed to delete")
			}
		} else if inNew && o.IsDeleted() { // needs un-deleting
			if err := tx.Unscoped().Model(&o).Update("deleted_at", nil).Error; err != nil {
				return types.NewErrFromGorm(err, "failed to undelete")
			}
		}
	}
	for _, n := range new {
		if err := tx.Unscoped().Where(&n).FirstOrCreate(&n).Error; err != nil {
			return types.NewErrFromGorm(err, "failed to create")
		}
	}
	return nil
}

func RollbackTransactionOnPanic(tx *gorm.DB) {
	if r := recover(); r != nil {
		tx.Rollback()
	}
}
