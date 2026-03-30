package studies

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/testutil"
	"github.com/ucl-arc-tre/portal/internal/types"

	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
)

// validAssetBase returns an AssetBase struct representing
// a set of valid data entities.
func validAssetBase() openapi.AssetBase {
	return openapi.AssetBase{
		Title:                "Valid Asset",
		Description:          "Valid description",
		ClassificationImpact: openapi.AssetBaseClassificationImpactPublic,
		Tier:                 1,
		Locations:            []string{"UK"},
		Protection:           openapi.AssetBaseProtectionAnonymisation,
		LegalBasis:           openapi.AssetBaseLegalBasisConsent,
		Format:               openapi.AssetBaseFormatElectronic,
		ExpiresAt:            time.Now().Format(config.DateFormat),
		Status:               openapi.AssetBaseStatusActive,
	}
}

// Unit test : TestValidateAssetData uses a table-driven unit test, which
// defines test cases in a slice, to test all branches in validateAssetData
func TestValidateAssetData(t *testing.T) {
	svc := &Service{}

	tests := []struct {
		name      string
		modify    func(*openapi.AssetBase)
		wantError bool
	}{
		// =========================
		//  VALID CASES
		// =========================
		{
			name:      "valid asset (baseline)",
			modify:    func(a *openapi.AssetBase) {},
			wantError: false,
		},
		{
			name: "title at minimum length",
			modify: func(a *openapi.AssetBase) {
				a.Title = "abcd"
			},
			wantError: false,
		},
		{
			name: "tier at lower boundary",
			modify: func(a *openapi.AssetBase) {
				a.Tier = 0
			},
			wantError: false,
		},
		{
			name: "tier at upper boundary",
			modify: func(a *openapi.AssetBase) {
				a.Tier = 4
			},
			wantError: false,
		},
		{
			name: "valid expiry date",
			modify: func(a *openapi.AssetBase) {
				a.ExpiresAt = "2025-12-31"
			},
			wantError: false,
		},

		// =========================
		//  INVALID CASES
		// =========================
		{
			name: "title too short",
			modify: func(a *openapi.AssetBase) {
				a.Title = "x"
			},
			wantError: true,
		},
		{
			name: "description too short",
			modify: func(a *openapi.AssetBase) {
				a.Description = "x"
			},
			wantError: true,
		},
		{
			name: "invalid classification",
			modify: func(a *openapi.AssetBase) {
				a.ClassificationImpact = "invalid"
			},
			wantError: true,
		},
		{
			name: "tier too low",
			modify: func(a *openapi.AssetBase) {
				a.Tier = -1
			},
			wantError: true,
		},
		{
			name: "tier too high",
			modify: func(a *openapi.AssetBase) {
				a.Tier = 5
			},
			wantError: true,
		},
		{
			name: "invalid protection",
			modify: func(a *openapi.AssetBase) {
				a.Protection = "invalid"
			},
			wantError: true,
		},
		{
			name: "invalid legal basis",
			modify: func(a *openapi.AssetBase) {
				a.LegalBasis = "invalid"
			},
			wantError: true,
		},
		{
			name: "invalid format",
			modify: func(a *openapi.AssetBase) {
				a.Format = "invalid"
			},
			wantError: true,
		},
		{
			name: "invalid expiry date",
			modify: func(a *openapi.AssetBase) {
				a.ExpiresAt = "not-a-date"
			},
			wantError: true,
		},
		{
			name: "invalid status",
			modify: func(a *openapi.AssetBase) {
				a.Status = "invalid"
			},
			wantError: true,
		},

		// =========================
		//  EDGE CASES
		// =========================
		{
			name: "empty title",
			modify: func(a *openapi.AssetBase) {
				a.Title = ""
			},
			wantError: true,
		},
		{
			name: "whitespace title",
			modify: func(a *openapi.AssetBase) {
				a.Title = "   "
			},
			wantError: true,
		},
		{
			name: "nil locations",
			modify: func(a *openapi.AssetBase) {
				a.Locations = nil
			},
			wantError: true,
		},
		{
			name: "empty locations",
			modify: func(a *openapi.AssetBase) {
				a.Locations = []string{}
			},
			wantError: true,
		},
	}

	for _, curTest := range tests {
		t.Run(curTest.name, func(t *testing.T) {
			asset := validAssetBase()
			curTest.modify(&asset)

			validationErr, err := svc.validateAssetData(asset)

			// Stop immediately if system-level error (e.g., panic, DB error)
			require.NoError(t, err, "unexpected error: %+v", err)

			assert.Equal(t, curTest.wantError, validationErr != nil, "validationErr: %+v", validationErr)

		})
	}
}

// Integration Test (with Postgres test container) for CreateAsset
func TestIntegration_CreateAsset(t *testing.T) {

	// Enable parallel test
	t.Parallel()

	// Create DB schema, and AutoMigrate only the models/tables required by this package
	db := testutil.NewTestDBSchema(t, testDBDSN, migrate)

	svc := &Service{db: db}

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
		ExpiresAt:            time.Now().AddDate(1, 0, 0).Format("2006-01-02"),
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
