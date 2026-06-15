package graceful

import (
	"slices"
	"sync"
	"time"

	gormlock "github.com/go-co-op/gocron-gorm-lock/v2"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

const (
	initConnectRetryDelay = 1 * time.Second
)

var (
	db     *gorm.DB // Singleton gorm DB - handles connection pooling
	dbOnce sync.Once
)

// Initialise the database and migrate required types
func InitDB() {
	models := []any{
		&gormlock.CronJobLock{},
		&types.User{},
		&types.Agreement{},
		&types.UserAgreementConfirmation{},
		&types.UserTrainingRecord{},
		&types.UserAttributes{},
		&types.Study{},
		&types.StudyAdmin{},
		&types.StudyOwnerChangeLog{},
		&types.StudyAgreementSignature{},
		&types.Asset{},
		&types.AssetLocation{},
		&types.AssetDataType{},
		&types.Contract{},
		&types.ContractObjectMetadata{},
		&types.UserSponsorship{},
		&types.Environment{},
		&types.Project{},
		&types.ProjectTRE{},
		&types.ProjectTRERoleBinding{},
		&types.ProjectAsset{},
		&types.TokenVerificationKey{},
		&types.Token{},
	}
	db := NewDB()
	mustExec(db, `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`)
	mustExec(db, `CREATE EXTENSION IF NOT EXISTS "pg_trgm";`)

	// Set up a sequence for the study caseref
	// this must exist before AutoMigrate is run below, as the Caseref column default references it
	// sequence starts at 10000 for portal studies while 0-9999 is reserved for legacy studies that will be migrated from sharepoint
	mustExec(db, `CREATE SEQUENCE IF NOT EXISTS study_caseref_seq START 10000`)

	migrateProjectStatus(db)

	if err := db.AutoMigrate(models...); err != nil {
		panic(err)
	}

	log.Debug().Msg("Initialised database")
}

// Create a new gorm DB, blocking until a connection is made
func NewDB() *gorm.DB {
	dbOnce.Do(func() {
		connectRetryDelay := initConnectRetryDelay
		var err error
		for {
			db, err = gorm.Open(postgres.New(postgres.Config{
				DSN:                  config.DBDataSourceName(),
				PreferSimpleProtocol: true,
			}), &gorm.Config{})
			if err == nil {
				return
			}
			log.Debug().Msg("Waiting for DB connection...")
			time.Sleep(connectRetryDelay)
			connectRetryDelay *= 2
		}
	})
	return db
}

type UpdateObject interface {
	UniqueKey() string
	IsDeleted() bool
}

// Update an existing list of many objects to their new values using
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

func mustExec(db *gorm.DB, sql string) {
	err := db.Exec(sql).Error
	if err != nil {
		panic(err)
	}
}

func migrateProjectStatus(db *gorm.DB) {
	migrator := db.Migrator()

	if migrator.HasColumn(&types.Project{}, "approval_status") {
		err := migrator.DropColumn(&types.Project{}, "approval_status")
		if err != nil {
			panic(err)
		}
	}
}
