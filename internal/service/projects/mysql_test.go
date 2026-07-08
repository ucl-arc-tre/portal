//go:build !integration

package projects

import (
	"testing"
	"time"

	"github.com/glebarez/sqlite"
	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
	"gorm.io/gorm"
)

// Shadow structs that mirror the real Postgres tables so that AutoMigrate
// can build a usable schema for an in-memory sqlite DB.
type schemaUser struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey"`
	CreatedAt time.Time
	Username  string
}

func (schemaUser) TableName() string {
	return "users"
}

type schemaEnvironment struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt
	Name      string
	Tier      int
}

func (schemaEnvironment) TableName() string {
	return "environments"
}

type schemaProject struct {
	ID            uuid.UUID `gorm:"type:uuid;primaryKey"`
	CreatedAt     time.Time
	UpdatedAt     time.Time
	DeletedAt     gorm.DeletedAt
	Name          string
	CreatorUserID uuid.UUID
	StudyID       uuid.UUID
	EnvironmentID uuid.UUID
}

func (schemaProject) TableName() string {
	return "projects"
}

type schemaProjectTRE struct {
	ID                            uuid.UUID `gorm:"type:uuid;primaryKey"`
	CreatedAt                     time.Time
	UpdatedAt                     time.Time
	DeletedAt                     gorm.DeletedAt
	ProjectID                     uuid.UUID
	EgressNumberRequiredApprovals int
	ExternalEncryptionEnabled     bool
	AirlockSSHEnabled             bool
	AirlockWhitelist              string
	Status                        string
}

func (schemaProjectTRE) TableName() string {
	return "project_tres"
}

type schemaProjectTRERoleBinding struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey"`
	CreatedAt    time.Time
	UpdatedAt    time.Time
	DeletedAt    gorm.DeletedAt
	ProjectTREID uuid.UUID
	UserID       uuid.UUID
	Role         string
}

func (schemaProjectTRERoleBinding) TableName() string {
	return "project_tre_role_bindings"
}

func newTestSqliteDB(t *testing.T) *gorm.DB {
	t.Helper()
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	require.NoError(t, err)
	require.NoError(t, db.AutoMigrate(
		&schemaUser{},
		&schemaEnvironment{},
		&schemaProject{},
		&schemaProjectTRE{},
		&schemaProjectTRERoleBinding{},
	))
	return db
}
