package graceful

import (
	"slices"
	"strings"
	"sync"
	"time"

	gormlock "github.com/go-co-op/gocron-gorm-lock/v2"
	"github.com/google/uuid"
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
		&types.StudyAgreementSignature{},
		&types.Asset{},
		&types.AssetLocation{},
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

	migrateContractStudyIds(db)
	migrateContracts(db)

	// Set up a sequence for the study caseref
	// this must exist before AutoMigrate is run below, as the Caseref column default references it
	// sequence starts at 10000 for portal studies while 0-9999 is reserved for legacy studies that will be migrated from sharepoint
	mustExec(db, `CREATE SEQUENCE IF NOT EXISTS study_caseref_seq START 10000`)

	if err := db.AutoMigrate(models...); err != nil {
		panic(err)
	}

	migrateCaseref(db)

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

// migrateCaseref adds a unique auto-incrementing caseref to each existing study.
func migrateCaseref(db *gorm.DB) {
	// Backfill any studies that were created previously (i.e. those that have a NULL caseref).
	mustExec(db, `UPDATE studies SET caseref = nextval('study_caseref_seq') WHERE caseref IS NULL`)
	log.Info().Msg("Study caseref migration complete")
}

func migrateContracts(db *gorm.DB) {
	migrator := db.Migrator()

	if !migrator.HasTable(&types.Contract{}) {
		return // fresh deployment - nothing to migrate
	} else if migrator.HasColumn(&types.Contract{}, "title") &&
		migrator.HasTable(&types.ContractObjectMetadata{}) {
		return // already migrated
	}

	if err := db.AutoMigrate(&types.ContractObjectMetadata{}); err != nil {
		log.Err(err).Msg("Failed to automigrate ContractObjectMetadata for migration")
		return
	}

	if err := migrator.AddColumn(&types.Contract{}, "title"); err != nil {
		panic(err)
	}

	tx := db.Begin()
	defer RollbackTransactionOnPanic(tx)

	contractPartials := []struct {
		ID        uuid.UUID `gorm:"id"`
		Filename  string    `gorm:"filename"`
		CreatedAt time.Time `gorm:"created_at"`
	}{}

	err := tx.Table("contracts").Select("id, filename, created_at").Scan(&contractPartials).Error
	if err != nil {
		panic(err)
	}

	for _, contractPartial := range contractPartials {
		title, _ := strings.CutSuffix(contractPartial.Filename, ".pdf")
		err = tx.Table("contracts").Where("id = ?", contractPartial.ID).Update("title", title).Error
		if err != nil {
			panic(err)
		}

		contractMetadata := types.ContractObjectMetadata{
			Filename:   contractPartial.Filename,
			ContractID: contractPartial.ID,
		}
		contractMetadata.ID = contractPartial.ID
		contractMetadata.CreatedAt = contractPartial.CreatedAt

		if err := tx.Create(&contractMetadata).Error; err != nil {
			panic(err)
		}
	}
	if err := tx.Commit().Error; err != nil {
		panic(err)
	}
}

// Set a study id column of contracts using their existing values
// set in the associated asset
func migrateContractStudyIds(db *gorm.DB) {
	migrator := db.Migrator()

	contract := types.Contract{}
	if !migrator.HasTable(&contract) {
		log.Info().Msg("Contract table did not exist")
		return
	}
	if migrator.HasColumn(&contract, "study_id") {
		log.Info().Msg("Contract study_id already migrated")
		return
	}

	links := []struct {
		StudyId    uuid.UUID `gorm:"study_id"`
		ContractId uuid.UUID `gorm:"contract_id"`
	}{}

	err := db.Table("contracts").
		Joins("INNER JOIN assets ON assets.id = contracts.asset_id").
		Select("contracts.id AS contract_id, assets.study_id AS study_id").
		Scan(&links).Error
	if err != nil {
		panic(err)
	}

	if err := migrator.AddColumn(&contract, "study_id"); err != nil {
		panic(err)
	}
	for _, link := range links {
		err := db.Model(&contract).
			Where("id = ?", link.ContractId).
			Update("study_id", link.StudyId).Error
		if err != nil {
			log.Err(err).Any("contractId", link.ContractId).Msg("Failed to set study id for contract")
		}
	}
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
