//go:build integration

package studies

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/ucl-arc-tre/portal/internal/testutil"
	"gorm.io/gorm"

	"github.com/ucl-arc-tre/portal/internal/types"

	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
)

func ptr[T any](value T) *T { return &value }

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

func TestIntegration_CreateAsset(t *testing.T) {

	// Enable parallel test
	t.Parallel()

	// Create unique schema for this test
	db := testutil.NewTestDBSchema(t, migrate)

	svc := &Service{db: db, entra: &testutil.FakeEntra{}}

	user := types.User{
		Username: "username",
	}
	err := db.Create(&user).Error
	require.NoError(t, err)

	study := types.Study{
		OwnerUserID:    user.ID,
		ApprovalStatus: string(openapi.Incomplete), // Initial status is "Incomplete" until the contract and assets are created
	}
	err = db.Create(&study).Error
	require.NoError(t, err)
	studyID := study.ID

	assetData := openapi.AssetBase{
		Title:                "Integration Asset",
		Description:          "Integration description",
		ClassificationImpact: openapi.AssetBaseClassificationImpactPublic,
		Tier:                 2,
		Locations:            []string{"UK", "EU"},
		Protection:           openapi.AssetBaseProtectionAnonymisation,
		LegalBasis:           openapi.AssetBaseLegalBasisConsent,
		Format:               openapi.AssetBaseFormatElectronic,
		ExpiresAt:            ptr(time.Now().AddDate(1, 0, 0).Format("2006-01-02")),
		Status:               openapi.AssetBaseStatusActive,
	}

	validationErr, err := svc.CreateAsset(user, assetData, studyID)

	require.NoError(t, err)
	require.Nil(t, validationErr)

	// Verify asset exists
	var asset types.Asset
	err = db.First(&asset, "title = ?", "Integration Asset").Error
	require.NoError(t, err)

	assert.Equal(t, user.ID, asset.CreatorUserID)
	assert.Equal(t, studyID, asset.StudyID)
	assert.Equal(t, "public", asset.ClassificationImpact)
	assert.Equal(t, 2, asset.Tier)

	// Verify locations
	var locations []types.AssetLocation
	err = db.Where("asset_id = ?", asset.ID).Find(&locations).Error
	require.NoError(t, err)

	assert.Len(t, locations, 2)

	locationValues := []string{locations[0].Location, locations[1].Location}
	assert.ElementsMatch(t, []string{"UK", "EU"}, locationValues)
}
