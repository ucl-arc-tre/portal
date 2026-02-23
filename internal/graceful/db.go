package graceful

import (
	"slices"
	"time"

	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
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
		&types.TokenVerificationKey{},
		&types.Token{},
	}
	db := NewDB()
	db.Exec(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`)

	migrateContractStudyIds(db)

	if err := db.AutoMigrate(models...); err != nil {
		panic(err)
	}

	migrateContracts(db)
	migrateExternals(db)

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

func migrateExternals(db *gorm.DB) {
	tx := db.Begin()
	defer RollbackTransactionOnPanic(tx)

	externalUsersWithoutEmail := []types.User{}
	err := tx.Model(&types.User{}).
		Joins("LEFT JOIN user_attributes ON user_attributes.user_id = users.id").
		Where("COALESCE(user_attributes.email, '') = '' AND username NOT LIKE ?", "%"+config.EntraTenantPrimaryDomain()).
		Find(&externalUsersWithoutEmail).Error
	if err != nil {
		panic(err)
	}

	// All external users without a set email need to be dropped as they may have two identities
	// prior to #486
	for _, user := range externalUsersWithoutEmail {
		err := tx.Select(clause.Associations).Delete(&user).Error
		if err != nil {
			panic(err)
		}
	}

	if err := tx.Commit().Error; err != nil {
		log.Err(err).Msg("Failed to commit migration")
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
