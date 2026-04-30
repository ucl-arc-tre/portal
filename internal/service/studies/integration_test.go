//go:build integration

package studies

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/controller/s3"
	"github.com/ucl-arc-tre/portal/internal/testutil"
	"gorm.io/gorm"

	"github.com/ucl-arc-tre/portal/internal/types"

	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
)

func ptr[T any](value T) *T { return &value }

// To be called by each test within this package to AutoMigrate
// only the models/tables required by this package
func migrate(db *gorm.DB) error {

	// Run migrations, only the models/tables required by this package
	err := db.AutoMigrate(
		&types.User{},
		&types.Study{},
		&types.Asset{},
		&types.AssetLocation{},
		&types.Contract{},
		&types.ContractObjectMetadata{},
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

	svc := &Service{db: db, entra: &testutil.MockEntra{}}

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

	err = svc.CreateAsset(user, assetData, studyID)

	require.NoError(t, err)

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

func TestIntegration_ValidateContract(t *testing.T) {

	// Enable parallel test
	t.Parallel()

	now := time.Now()
	later := now.Add(24 * time.Hour)

	// Create unique schema for this test
	db := testutil.NewTestDBSchema(t, migrate)

	// set up test config
	config.Init()
	if err := config.SetforTesting("entra.primary_domain", "testIntegration.com"); err != nil {
		t.Fatal(err)
	}

	creator := types.User{
		Username: "bob@testIntegration.com",
	}
	assert.NoError(t, db.Create(&creator).Error)

	signatoryUser := types.User{
		Username: "user1@testIntegration.com",
	}
	assert.NoError(t, db.Create(&signatoryUser).Error)

	study := types.Study{
		OwnerUserID:    creator.ID,
		ApprovalStatus: string(openapi.Incomplete), // Initial status is "Incomplete" until the contract and assets are created
	}
	assert.NoError(t, db.Create(&study).Error)
	studyID := study.ID

	asset := types.Asset{
		CreatorUserID: creator.ID,
		StudyID:       studyID,
	}
	assert.NoError(t, db.Create(&asset).Error)

	validBase := openapi.ContractBase{
		Title:                 "Valid Contract",
		OrganisationSignatory: "user1@testIntegration.com",
		ThirdPartyName:        ptr("Third Party"),
		Status:                openapi.ContractBaseStatusProposed,
		StartDate:             ptr(now.Format("2006-01-02")),
		ExpiryDate:            ptr(later.Format("2006-01-02")),
		AssetIds:              []string{asset.ID.String()},
	}

	tests := []struct {
		name      string
		modify    func(*openapi.ContractBase)
		mockUsers []types.Username
		expectErr bool
	}{
		// =========================
		//  VALID CASES
		// =========================
		{
			name:      "valid contract (baseline)",
			modify:    func(c *openapi.ContractBase) {},
			mockUsers: []types.Username{signatoryUser.Username}, //[]string{"user1"},
			expectErr: false,
		},

		// =========================
		//  INVALID CASES
		// =========================
		{
			name: "invalid title (too short)",
			modify: func(c *openapi.ContractBase) {
				c.Title = "x"
			},
			expectErr: true,
		},
		{
			name: "invalid signatory",
			modify: func(c *openapi.ContractBase) {
				c.OrganisationSignatory = "bad@gmail.com"
			},
			expectErr: true,
		},
		{
			name: "invalid third party name",
			modify: func(c *openapi.ContractBase) {
				c.ThirdPartyName = ptr("a")
			},
			expectErr: true,
		},
		{
			name: "invalid status",
			modify: func(c *openapi.ContractBase) {
				c.Status = "wrong"
			},
			expectErr: true,
		},
		{
			name: "missing start date",
			modify: func(c *openapi.ContractBase) {
				c.StartDate = ptr("")
			},
			expectErr: true,
		},

		// =========================
		//  EDGE CASES
		// =========================
		{
			name: "start date after expiry",
			modify: func(c *openapi.ContractBase) {
				c.StartDate = ptr(later.Format("2006-01-02"))
				c.ExpiryDate = ptr(now.Format("2006-01-02"))
			},
			expectErr: true,
		},
		{
			name: "asset mismatch",
			modify: func(c *openapi.ContractBase) {
				c.AssetIds = []string{uuid.New().String()}
			},
			mockUsers: []types.Username{signatoryUser.Username}, //[]string{"user1"},
			expectErr: true,
		},
		{
			name:      "multiple users returned",
			modify:    func(c *openapi.ContractBase) {},
			mockUsers: []types.Username{types.Username("u1"), types.Username("u2")},
			expectErr: true,
		},
	}

	for _, curTest := range tests {
		t.Run(curTest.name, func(t *testing.T) {
			base := validBase
			curTest.modify(&base)

			ctx := context.Background()

			// set up mocks
			mockEntra := new(testutil.MockEntra)
			mockEntra.On("FindUsernames", ctx, base.OrganisationSignatory).
				Return(curTest.mockUsers, nil)

			service := &Service{
				db:    db,
				entra: mockEntra,
			}

			err := service.validateContract(ctx, studyID, base)
			if curTest.expectErr {
				assert.NotNil(t, err)
			} else {
				assert.Nil(t, err)
			}
		})
	}
}

func TestIntegration_CreateContract(t *testing.T) {

	// Enable parallel test
	t.Parallel()

	ctx := context.Background()

	// Create unique schema for this test
	db := testutil.NewTestDBSchema(t, migrate)

	// stub entra + users + S3
	entra := new(testutil.MockEntra)
	users := new(testutil.MockUsers)
	mockS3 := new(testutil.MockS3)

	svc := &Service{
		db:    db,
		entra: entra,
		users: users,
		s3:    mockS3,
	}

	// set up test config
	config.Init()
	if err := config.SetforTesting("entra.primary_domain", "testIntegration.com"); err != nil {
		t.Fatal(err)
	}

	// set up required models
	creator := types.User{
		Username: "bob@testIntegration.com",
	}
	assert.NoError(t, db.Create(&creator).Error)

	signatoryUser := types.User{
		Username: "user1@testIntegration.com",
	}
	assert.NoError(t, db.Create(&signatoryUser).Error)

	study := types.Study{
		OwnerUserID:    creator.ID,
		ApprovalStatus: string(openapi.Incomplete), // Initial status is "Incomplete" until the contract and assets are created
	}
	assert.NoError(t, db.Create(&study).Error)
	studyID := study.ID

	asset := types.Asset{
		CreatorUserID: creator.ID,
		StudyID:       studyID,
	}
	assert.NoError(t, db.Create(&asset).Error)

	contractBase := openapi.ContractBase{
		Title:                 "Integration Contract",
		OrganisationSignatory: "user1@testIntegration.com",
		ThirdPartyName:        ptr("Third Party"),
		Status:                openapi.ContractBaseStatusProposed,
		StartDate:             ptr("2024-01-01"),
		ExpiryDate:            ptr("2024-12-31"),
		AssetIds:              []string{asset.ID.String()},
	}

	// set up mocks
	entra.On("FindUsernames", ctx, contractBase.OrganisationSignatory).
		Return([]types.Username{signatoryUser.Username}, nil)

	users.On("PersistedUser", types.Username(contractBase.OrganisationSignatory)).Return(signatoryUser, nil)

	contract, err := svc.CreateContract(ctx, studyID, contractBase, creator)
	assert.NoError(t, err)
	assert.NotNil(t, contract)

	s3Object := testutil.MockS3Object("integration test contract")
	contractObjectmetadata := types.ContractObjectMetadata{
		Filename:   "contract.pdf",
		ContractID: contract.ID,
	}

	contractObject := ContractObject{
		Object: s3Object,
		Meta:   contractObjectmetadata,
	}

	mockS3.On("StoreObject",
		mock.Anything,
		mock.MatchedBy(func(m s3.ObjectMetadata) bool {
			return m.Kind == s3.ContractKind
		}), // this custom matcher checks only Kind == contract, and avoids checking strict equality of s3.ObjectMetadata.Id, which is dynamically generated in transaction
		mock.Anything,
	).Return(nil)

	metadata, err := svc.CreateContractObject(ctx, studyID, contractObject)
	assert.NoError(t, err)
	assert.NotNil(t, metadata)

	fetched, err := svc.GetContract(studyID, contract.ID)
	assert.NoError(t, err)
	assert.NotNil(t, fetched)

	// Verification
	assert.Equal(t, contract.ID, metadata.ContractID)
	assert.Equal(t, contract.ID, fetched.ID)
	assert.Len(t, fetched.Assets, 1)
	assert.Equal(t, signatoryUser.ID, fetched.SignatoryUser.ID)

	assert.Equal(t, studyID, fetched.StudyID)
	assert.Equal(t, creator.ID, fetched.CreatorUserID)

}
