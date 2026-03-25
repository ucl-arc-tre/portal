package testutil

import (
	"context"
	"fmt"

	"time"

	"github.com/stretchr/testify/require"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"

	"testing"

	"github.com/google/uuid"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Container struct {
	DSN       string
	terminate func(context.Context) error
}

/*
Setup Helper for integration test
StartPostgresContainer starts a PostgreSQL container.
Call this func from TestMain within each package.
*/
func StartPostgresContainer(ctx context.Context) (*Container, error) {
	req := testcontainers.ContainerRequest{
		Image:        "postgres:15",
		ExposedPorts: []string{"5432/tcp"},
		Env: map[string]string{
			"POSTGRES_USER":     "postgres",
			"POSTGRES_PASSWORD": "postgres",
			"POSTGRES_DB":       "testdb",
		},
		WaitingFor: wait.ForListeningPort("5432/tcp").
			WithStartupTimeout(30 * time.Second),
	}

	container, err := testcontainers.GenericContainer(ctx,
		testcontainers.GenericContainerRequest{
			ContainerRequest: req,
			Started:          true,
		},
	)
	if err != nil {
		return nil, err
	}

	host, err := container.Host(ctx)
	if err != nil {
		return nil, err
	}
	port, err := container.MappedPort(ctx, "5432")
	if err != nil {
		return nil, err
	}

	dsn := fmt.Sprintf(
		"host=%s port=%s user=postgres password=postgres dbname=testdb sslmode=disable", // pragma: allowlist secret
		host, port.Port(),
	)

	return &Container{
		DSN: dsn,
		terminate: func(ctx context.Context) error {
			return container.Terminate(ctx)
		},
	}, nil
}

type Migrator func(*gorm.DB) error

/*
Setup Helper for integration test
NewTestDBSchema creates a new database schema.
Call this func from each test within all packages.
*/
func NewTestDBSchema(t *testing.T, baseDSN string, migrate Migrator) *gorm.DB {
	t.Helper()

	require := require.New(t)

	schema := "test_" + uuid.NewString()

	// Admin connection
	adminDB, err := gorm.Open(postgres.Open(baseDSN), &gorm.Config{})
	require.NoError(err, "admin connect")

	// Create schema
	err = adminDB.Exec(fmt.Sprintf(`CREATE SCHEMA "%s"`, schema)).Error
	require.NoError(err, "create schema")

	// Connect with search_path
	dsn := fmt.Sprintf("%s search_path=%s", baseDSN, schema)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	require.NoError(err, "connect test db")

	// Run migrations
	err = migrate(db)
	require.NoError(err, "migrate")

	// Cleanup
	t.Cleanup(func() {
		// Use require during setup, but prefer t.Errorf (non-fatal) in cleanup because if cleanup
		// fails, the test has already finished running and failure reporting can be less clear
		if err := adminDB.Exec(fmt.Sprintf(`DROP SCHEMA "%s" CASCADE`, schema)).Error; err != nil {
			t.Errorf("drop schema: %v", err)
		}
		//adminDB.Exec(fmt.Sprintf(`DROP SCHEMA "%s" CASCADE`, schema))
	})

	return db
}
