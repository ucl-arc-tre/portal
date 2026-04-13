package testutil

import (
	"fmt"
	"os"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Migrator func(*gorm.DB) error

/*
Setup Helper for integration test
NewTestDBSchema creates a new database schema.
Call this func from each test within all packages.
*/
func NewTestDBSchema(t *testing.T, migrate Migrator) *gorm.DB {
	t.Helper()

	require := require.New(t)

	schema := "test_" + uuid.NewString()

	// Admin connection
	baseDSN := os.Getenv("DATABASE_URL") // as defined in docker-compose.yaml
	adminDB, err := gorm.Open(postgres.Open(baseDSN), &gorm.Config{})
	require.NoError(err, "admin connect")

	// Create schema
	err = adminDB.Exec(fmt.Sprintf(`CREATE SCHEMA "%s"`, schema)).Error
	require.NoError(err, "create schema")

	// Connect with search_path
	dsn := fmt.Sprintf("%s search_path=%s", baseDSN, schema)

	testDB, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	require.NoError(err, "connect test db")

	// Run migrations
	err = migrate(testDB)
	require.NoError(err, "migrate")

	// Cleanup
	t.Cleanup(func() {
		// Use require during setup, but prefer t.Errorf (non-fatal) in cleanup because if cleanup
		// fails, the test has already finished running and failure reporting can be less clear
		if err := adminDB.Exec(fmt.Sprintf(`DROP SCHEMA "%s" CASCADE`, schema)).Error; err != nil {
			t.Errorf("failed to drop schema: %v", err)
		}

		// Close connections /  BOTH pools
		if adminSqlDB, err := adminDB.DB(); err == nil {
			_ = adminSqlDB.Close()
		}

		if testSqlDB, err := testDB.DB(); err == nil {
			_ = testSqlDB.Close()
		}

	})

	return testDB
}
