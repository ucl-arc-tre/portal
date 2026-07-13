//go:build integration

package users

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/service/agreements"
	"github.com/ucl-arc-tre/portal/internal/testutils/mockcontrollers"
	"github.com/ucl-arc-tre/portal/internal/testutils/mockdb"
	"github.com/ucl-arc-tre/portal/internal/testutils/mocknotifications"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

// To be called by each test within this package to AutoMigrate
// only the models/tables required by this package
func migrate(db *gorm.DB) error {

	// Run migrations, only the models/tables required by this package
	err := db.AutoMigrate(
		&types.User{},
		&types.Agreement{},
		&types.UserAgreementConfirmation{},
		&types.UserTrainingRecord{},
		&types.UserAttributes{},
		&types.UserSponsorship{},
	)
	if err != nil {
		return err
	}

	return nil
}

func createTestUser(t *testing.T, db *gorm.DB, username string) types.User {
	t.Helper()

	user := types.User{
		Username: types.Username(username),
	}

	err := db.Create(&user).Error
	require.NoError(t, err)

	return user
}

func TestPersistedUser_CreatesUser(t *testing.T) {

	t.Parallel()

	db := mockdb.NewTestDBSchema(t, migrate)

	service := &Service{
		db:            db,
		notifications: &mocknotifications.MockNotifications{},
	}

	username := types.Username("bob@testIntegration.com")

	user, err := service.PersistedUser(username)

	require.NoError(t, err)
	require.Equal(t, username, user.Username)
	require.NotZero(t, user.ID)
}

func TestPersistedUser_ReturnsExistingUser(t *testing.T) {

	t.Parallel()

	db := mockdb.NewTestDBSchema(t, migrate)

	existing := createTestUser(t, db, "bob@testIntegration.com")

	service := &Service{
		db: db,
	}

	user, err := service.PersistedUser("bob@testIntegration.com")

	require.NoError(t, err)
	require.Equal(t, existing.ID, user.ID)
}

func TestPersistedUser_InvalidUsername(t *testing.T) {

	t.Parallel()

	db := mockdb.NewTestDBSchema(t, migrate)

	service := &Service{
		db: db,
	}

	invalid := types.Username("")
	user, err := service.PersistedUser(invalid)
	require.Error(t, err)
	assert.Equal(t, types.User{}, user)
	assert.Contains(t, err.Error(), "invalid")
}

func TestPersistedExternalUser_CreatesNewUser(t *testing.T) {

	t.Parallel()

	db := mockdb.NewTestDBSchema(t, migrate)

	service := &Service{
		db:            db,
		notifications: &mocknotifications.MockNotifications{},
	}

	user, err := service.PersistedExternalUser(
		"alice",
		"alice@testIntegration.com",
	)

	require.NoError(t, err)
	require.Equal(t, types.Username("alice"), user.Username)

	var attrs types.UserAttributes
	err = db.Where("user_id = ?", user.ID).First(&attrs).Error

	require.NoError(t, err)
	require.Equal(t, Email("alice@testIntegration.com"), Email(attrs.Email))
}

func TestPersistedExternalUser_UpdatesUsername(t *testing.T) {

	t.Parallel()

	db := mockdb.NewTestDBSchema(t, migrate)

	existing := createTestUser(t, db, "old_username")

	attrs := types.UserAttributes{
		UserID: existing.ID,
		Email:  "alice@testIntegration.com",
	}

	require.NoError(t, db.Create(&attrs).Error)

	service := &Service{
		db: db,
	}

	user, err := service.PersistedExternalUser(
		"new_username",
		"alice@testIntegration.com",
	)

	require.NoError(t, err)
	require.Equal(t, types.Username("new_username"), user.Username)

	var updated types.User
	require.NoError(t, db.First(&updated, existing.ID).Error)

	require.Equal(t, types.Username("new_username"), updated.Username)
}

func TestFind_ReturnsPortalAndEntraUsers(t *testing.T) {

	// Note: Remove t.Parallel() from RBAC-dependent integration tests

	db := mockdb.NewTestDBSchema(t, migrate)
	graceful.SetDBForTesting(db)
	rbac.Init()

	alice := createTestUser(t, db, "alice@testIntegration.com")

	require.NoError(t, db.Create(&types.UserAttributes{
		UserID:     alice.ID,
		ChosenName: "Alice Smith",
	}).Error)

	mockEntra := new(mockcontrollers.MockEntra)
	svc := &Service{
		db:    db,
		entra: mockEntra,
	}

	// set up mocks
	mockEntra.On("FindUsernames", context.Background(), "alice").
		Return([]types.Username{"alice@testIntegration.com"}, nil)

	results, err := svc.Find(context.Background(), "alice")

	require.NoError(t, err)
	require.Len(t, results, 1)

	require.Equal(t, "alice@testIntegration.com", results[0].User.Username)
}

func TestAllApprovedResearchers(t *testing.T) {

	t.Parallel()

	db := mockdb.NewTestDBSchema(t, migrate)

	service := &Service{
		db: db,
	}

	user := createTestUser(t, db, "alice@testIntegration.com")

	agreement := types.Agreement{
		Type: agreements.ApprovedResearcherType,
	}

	require.NoError(t, db.Create(&agreement).Error)

	require.NoError(t, db.Create(&types.UserAgreementConfirmation{
		UserID:      user.ID,
		AgreementID: agreement.ID,
	}).Error)

	require.NoError(t, db.Create(&types.UserTrainingRecord{
		UserID: user.ID,
		Kind:   types.TrainingKindNHSD,
	}).Error)

	records, err := service.AllApprovedResearchers()

	require.NoError(t, err)
	require.Len(t, records, 1)
	require.Equal(t, "alice@testIntegration.com", string(records[0].Username))
}

func TestCreateUserSponsorship(t *testing.T) {

	t.Parallel()

	db := mockdb.NewTestDBSchema(t, migrate)

	service := &Service{
		db: db,
	}

	user := createTestUser(t, db, "alice@testIntegration.com")
	sponsor := types.Sponsor{User: createTestUser(t, db, "bob@testIntegration.com")}

	got, err := service.createUserSponsorship(user, sponsor)

	require.NoError(t, err)

	assert.NotZero(t, got.ID)
	assert.Equal(t, user.ID, got.UserID)
	assert.Equal(t, sponsor.ID, got.SponsorID)
	assert.NotZero(t, got.CreatedAt)

	// Verify persisted
	var dbRecord types.UserSponsorship

	err = db.Where(
		"user_id = ? AND sponsor_id = ?",
		user.ID,
		sponsor.ID,
	).First(&dbRecord).Error

	require.NoError(t, err)

	assert.Equal(t, got.ID, dbRecord.ID)
}

func TestCreateNHSDTrainingRecord(t *testing.T) {

	t.Parallel()

	db := mockdb.NewTestDBSchema(t, migrate)

	service := &Service{
		db: db,
	}
	user := createTestUser(t, db, "alice@testIntegration.com")

	completedAt := time.Now().UTC()

	err := service.CreateTrainingRecord(user, types.TrainingKindNHSD, completedAt)

	require.NoError(t, err)

	var record types.UserTrainingRecord

	err = db.Where(
		"user_id = ? AND kind = ?",
		user.ID,
		types.TrainingKindNHSD,
	).First(&record).Error

	require.NoError(t, err)

	assert.Equal(t, user.ID, record.UserID)
	assert.Equal(t, types.TrainingKindNHSD, record.Kind)
	assert.WithinDuration(t, completedAt, record.CompletedAt, time.Second)
	assert.NotZero(t, record.CreatedAt)
}
