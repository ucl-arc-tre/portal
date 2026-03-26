package studies

import (
	"context"
	"os"
	"testing"

	"github.com/ucl-arc-tre/portal/internal/testutil"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

var testDBDSN string

/*
Set up for integration testing:
- spin up a PostgreSQL container per package.
- for each test: create a unique schema, run migrations within that schema,
clean up (drop schema) after the test completes.

Using TestMain to start a Postgres test container once, and
this container will be used by all tests within this package
*/
func TestMain(m *testing.M) {
	ctx := context.Background()

	// start postgres container once
	container, err := testutil.StartPostgresContainer(ctx)
	if err != nil {
		panic(err)
	}

	testDBDSN = container.DSN

	// run tests
	code := m.Run()

	// terminate container
	_ = container.Terminate(ctx)

	os.Exit(code)
}

// To be called by each test within this package to AutoMigrate
// only the models/tables required by this package
func migrate(db *gorm.DB) error {

	// enable uuid extension
	if err := db.Exec(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`).Error; err != nil {
		return err
	}

	// create sequence
	if err := db.Exec(`CREATE SEQUENCE IF NOT EXISTS study_caseref_seq`).Error; err != nil {
		return err
	}

	// Run migrations, only the models/tables required by this package
	err := db.AutoMigrate(
		&types.AssetLocation{},
	)
	if err != nil {
		return err
	}

	return nil

}
