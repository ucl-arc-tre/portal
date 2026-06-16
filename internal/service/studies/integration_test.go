//go:build integration

package studies

import (
	"context"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/controller/s3"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/testutils/mockcontrollers"
	"github.com/ucl-arc-tre/portal/internal/testutils/mockdb"
	"github.com/ucl-arc-tre/portal/internal/testutils/mockusers"
	"gorm.io/gorm"

	"github.com/ucl-arc-tre/portal/internal/types"

	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
)

// To be called by each test within this package to AutoMigrate
// only the models/tables required by this package
func migrate(db *gorm.DB) error {

	// Run migrations, only the models/tables required by this package
	err := db.AutoMigrate(
		&types.User{},
		&types.Study{},
		&types.StudyAdmin{},
		&types.StudyOwnerChangeLog{},
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

	t.Parallel()

	// Create unique schema for this test
	db := mockdb.NewTestDBSchema(t, migrate)

	svc := &Service{db: db, entra: &mockcontrollers.MockEntra{}}

	user := types.User{
		Username: "username",
	}
	err := db.Create(&user).Error
	require.NoError(t, err)

	study := types.Study{
		OwnerUserID:    user.ID,
		ApprovalStatus: string(openapi.StudyApprovalStatusIncomplete), // Initial status is "Incomplete" until the contract and assets are created
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
		Protection:           new(openapi.AssetBaseProtectionAnonymisation),
		LegalBasis:           new(openapi.AssetBaseLegalBasisConsent),
		Format:               openapi.AssetBaseFormatElectronic,
		ExpiresAt:            new(time.Now().AddDate(1, 0, 0).Format("2006-01-02")),
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

	t.Parallel()

	now := time.Now()
	later := now.Add(24 * time.Hour)

	// Create unique schema for this test
	db := mockdb.NewTestDBSchema(t, migrate)

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
		ApprovalStatus: string(openapi.StudyApprovalStatusIncomplete), // Initial status is "Incomplete" until the contract and assets are created
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
		ThirdPartyName:        new("Third Party"),
		Status:                openapi.ContractBaseStatusActive,
		StartDate:             new(now.Format("2006-01-02")),
		ExpiryDate:            new(later.Format("2006-01-02")),
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
				c.ThirdPartyName = new("a")
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
				c.StartDate = new("")
			},
			expectErr: true,
		},

		// =========================
		//  EDGE CASES
		// =========================
		{
			name: "start date after expiry",
			modify: func(c *openapi.ContractBase) {
				c.StartDate = new(later.Format("2006-01-02"))
				c.ExpiryDate = new(now.Format("2006-01-02"))
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
			mockEntra := new(mockcontrollers.MockEntra)
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

	t.Parallel()

	ctx := context.Background()

	// Create unique schema for this test
	db := mockdb.NewTestDBSchema(t, migrate)

	// stub entra + users + S3
	mockEntra := new(mockcontrollers.MockEntra)
	mockUsers := new(mockusers.MockUsers)
	mockS3 := new(mockcontrollers.MockS3)

	svc := &Service{
		db:    db,
		entra: mockEntra,
		users: mockUsers,
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
		ApprovalStatus: string(openapi.StudyApprovalStatusIncomplete), // Initial status is "Incomplete" until the contract and assets are created
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
		ThirdPartyName:        new("Third Party"),
		Status:                openapi.ContractBaseStatusActive,
		StartDate:             new("2024-01-01"),
		ExpiryDate:            new("2024-12-31"),
		AssetIds:              []string{asset.ID.String()},
	}

	// set up mocks
	mockEntra.On("FindUsernames", ctx, contractBase.OrganisationSignatory).
		Return([]types.Username{signatoryUser.Username}, nil)

	mockUsers.On("PersistedUser", types.Username(contractBase.OrganisationSignatory)).Return(signatoryUser, nil)

	contract, err := svc.CreateContract(ctx, studyID, contractBase, creator)
	assert.NoError(t, err)
	assert.NotNil(t, contract)

	s3Object := mockcontrollers.MockS3Object("integration test contract")
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

func TestIntegration_ValidateStudyData(t *testing.T) {

	t.Parallel()

	// Create unique schema for this test
	db := mockdb.NewTestDBSchema(t, migrate)

	creator := types.User{
		Username: "bob@testIntegration.com",
	}
	assert.NoError(t, db.Create(&creator).Error)

	study := types.Study{
		OwnerUserID:    creator.ID,
		Title:          "Existing Study",
		ApprovalStatus: string(openapi.StudyApprovalStatusIncomplete), // Initial status is "Incomplete" until the contract and assets are created
	}
	assert.NoError(t, db.Create(&study).Error)

	baseRequest := openapi.StudyRequest{
		Title:                         "Valid Study",
		DataControllerOrganisation:    "Org",
		Description:                   new("Valid description"),
		AdditionalStudyAdminUsernames: []string{"admin1@testIntegration.com"},
	}

	tests := []struct {
		name      string
		modify    func(*openapi.StudyRequest)
		isUpdate  bool
		mockStaff bool
		expectErr bool
	}{
		// =========================
		//  VALID CASES
		// =========================
		{
			name:      "valid study request (baseline)",
			modify:    func(req *openapi.StudyRequest) {},
			mockStaff: true,
			expectErr: false,
		},

		// =========================
		//  INVALID CASES
		// =========================
		{
			name: "invalid title",
			modify: func(req *openapi.StudyRequest) {
				req.Title = "x"
			},
			mockStaff: true,
			expectErr: true,
		},
		{
			name: "missing organisation",
			modify: func(req *openapi.StudyRequest) {
				req.DataControllerOrganisation = "   "
			},
			mockStaff: true,
			expectErr: true,
		},
		{
			name: "description too long",
			modify: func(req *openapi.StudyRequest) {
				req.Description = new(strings.Repeat("a", 300))
			},
			mockStaff: true,
			expectErr: true,
		},
		{
			name: "DPO missing number",
			modify: func(req *openapi.StudyRequest) {
				req.IsDataProtectionOfficeRegistered = new(true)
				req.DataProtectionNumber = nil
			},
			mockStaff: true,
			expectErr: true,
		},
		{
			name: "invalid DPO format",
			modify: func(req *openapi.StudyRequest) {
				req.IsDataProtectionOfficeRegistered = new(true)
				req.DataProtectionNumber = new("BAD")
			},
			mockStaff: true,
			expectErr: true,
		},
		{
			name: "invalid CAG",
			modify: func(req *openapi.StudyRequest) {
				req.CagReference = new("BAD")
			},
			mockStaff: true,
			expectErr: true,
		},
		{
			name: "invalid NHS",
			modify: func(req *openapi.StudyRequest) {
				req.NhsEnglandReference = new("BAD")
			},
			mockStaff: true,
			expectErr: true,
		},
		{
			name: "too many admins",
			modify: func(req *openapi.StudyRequest) {
				req.AdditionalStudyAdminUsernames = []string{"a", "b", "c", "d", "e", "f"}
			},
			mockStaff: true,
			expectErr: true,
		},
		{
			name: "duplicate title on create",
			modify: func(req *openapi.StudyRequest) {
				req.Title = "Existing Study"
			},
			mockStaff: true,
			expectErr: true,
		},
		{
			name: "duplicate title allowed on update (same record)",
			modify: func(req *openapi.StudyRequest) {
				req.Title = "Existing Study"
			},
			isUpdate:  true,
			mockStaff: true,
			expectErr: false,
		},
		{
			name: "admin not staff",
			modify: func(req *openapi.StudyRequest) {
				req.AdditionalStudyAdminUsernames = []string{"alice@test.com"}
			},
			mockStaff: false,
			expectErr: true,
		},
		{
			name: "no admins",
			modify: func(req *openapi.StudyRequest) {
				req.AdditionalStudyAdminUsernames = []string{}
			},
			mockStaff: true,
			expectErr: false,
		},

		// =========================
		//  EDGE CASES
		// =========================
		{
			name: "title at min length",
			modify: func(req *openapi.StudyRequest) {
				req.Title = "Abcd"
			},
			mockStaff: true,
			expectErr: false,
		},
		{
			name: "description at max length",
			modify: func(req *openapi.StudyRequest) {
				req.Description = new(strings.Repeat("a", 255))
			},
			mockStaff: true,
			expectErr: false,
		},
	}

	for _, curTest := range tests {

		// to avoid curTest being reused across iterations, expecially in parallel tests
		curTest := curTest

		t.Run(curTest.name, func(t *testing.T) {

			req := baseRequest

			// deep copying because req := baseRequest copies the container, not the contents
			req.AdditionalStudyAdminUsernames = append(
				[]string{},
				baseRequest.AdditionalStudyAdminUsernames...,
			)

			if baseRequest.Description != nil {
				desc := *baseRequest.Description
				req.Description = &desc
			}

			curTest.modify(&req)

			ctx := context.Background()

			// set up mocks
			mockEntra := new(mockcontrollers.MockEntra)

			// mock all admin checks
			for _, username := range req.AdditionalStudyAdminUsernames {
				mockEntra.
					On("IsStaffMember", ctx, types.Username(username)).
					Return(curTest.mockStaff, nil).
					Maybe() // allows zero calls if no admins
			}

			svc := &Service{
				db:    db,
				entra: mockEntra,
			}

			err := svc.validateStudyData(context.Background(), req, curTest.isUpdate)

			if curTest.expectErr {
				assert.NotNil(t, err)
			} else {
				assert.Nil(t, err)
			}

			mockEntra.AssertExpectations(t)

		})
	}
}

func TestIntegration_CreateStudy(t *testing.T) {

	// Note: Remove t.Parallel() from RBAC-dependent integration tests

	ctx := context.Background()

	// Create unique schema for this test
	db := mockdb.NewTestDBSchema(t, migrate)

	rbac.InitForTesting(db)

	mockUsers := new(mockusers.MockUsers)
	mockEntra := new(mockcontrollers.MockEntra)

	service := &Service{
		db:    db,
		entra: mockEntra,
		users: mockUsers,
	}

	// Seed owner
	owner := types.User{
		Username: "bob@testIntegration.com",
	}
	require.NoError(t, db.Create(&owner).Error)
	require.NotEqual(t, uuid.Nil, owner.ID)

	// Seed admin users
	admin1 := types.User{Username: "admin1@testIntegration.com"}
	admin2 := types.User{Username: "admin2@testIntegration.com"}
	require.NoError(t, db.Create(&admin1).Error)
	require.NoError(t, db.Create(&admin2).Error)

	studyData := openapi.StudyRequest{
		Title:                      "Test Study",
		DataControllerOrganisation: "Org",
		AdditionalStudyAdminUsernames: []string{
			string(admin1.Username),
			string(admin2.Username),
		},
	}

	// mock all admin checks
	for _, username := range studyData.AdditionalStudyAdminUsernames {
		mockEntra.
			On("IsStaffMember", mock.Anything, types.Username(username)).
			Return(true, nil).
			Maybe() // allows zero calls if no admins

		mockEntra.On("SendIaaAssignmentNotification", mock.Anything, username, studyData.Title).Return(nil)
	}
	mockUsers.On("PersistedUser", admin1.Username).Return(admin1, nil)
	mockUsers.On("PersistedUser", admin2.Username).Return(admin2, nil)

	// Execute
	err := service.CreateStudy(ctx, owner, studyData)
	require.NoError(t, err)

	var studies []types.Study
	require.NoError(t, db.Find(&studies).Error)

	// Verify study created in db
	var created types.Study
	err = db.Where("owner_user_id = ?", owner.ID).First(&created).Error
	require.NoError(t, err)

	// Fetch using study ID
	fetchedStudies, err := service.StudiesById(created.ID)
	require.NoError(t, err)

	require.Len(t, fetchedStudies, 1)

	fetched := fetchedStudies[0]

	assert.Equal(t, owner.ID, fetched.OwnerUserID)
	assert.Equal(t, string(openapi.StudyApprovalStatusIncomplete), fetched.ApprovalStatus)
	assert.Len(t, fetched.StudyAdmins, 2)

	adminIDs := []uuid.UUID{}
	for _, sa := range fetched.StudyAdmins {
		adminIDs = append(adminIDs, sa.UserID)
	}

	assert.Contains(t, adminIDs, admin1.ID)
	assert.Contains(t, adminIDs, admin2.ID)

}
