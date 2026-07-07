//go:build integration

package projects

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"github.com/ucl-arc-tre/portal/internal/config"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/service/environments"
	"github.com/ucl-arc-tre/portal/internal/testutils/mockdb"
	"github.com/ucl-arc-tre/portal/internal/testutils/mockusers"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

// To be called by each test within this package to AutoMigrate
// only the models/tables required by this package
func migrate(db *gorm.DB) error {
	// Run migrations, only the models/tables required by this package
	err := db.AutoMigrate(
		&types.User{},
		&types.Study{},
		&types.StudyAdmin{},
		&types.Asset{},
		&types.Environment{},
		&types.Project{},
		&types.ProjectTRE{},
		&types.ProjectTRERoleBinding{},
		&types.ProjectTREUserConfig{},
		&types.ProjectAsset{},
	)
	if err != nil {
		return err
	}

	return nil
}

func TestCreateProjectTRE(t *testing.T) {
	// Note: Remove t.Parallel() from RBAC-dependent integration tests

	// Create unique schema for this test
	db := mockdb.NewTestDBSchema(t, migrate)

	rbac.InitForTesting(db)

	mockUsers := new(mockusers.MockUsers)

	svc := &Service{
		db:           db,
		users:        mockUsers,
		environments: environments.New(),
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

	user1 := types.User{
		Username: "alice@testIntegration.com",
	}
	require.NoError(t, db.Create(&user1).Error)

	rbac.AddRole(creator, rbac.ApprovedResearcher)
	rbac.AddRole(user1, rbac.ApprovedResearcher)

	study := types.Study{
		OwnerUserID:    creator.ID,
		ApprovalStatus: string(openapi.ProjectTREStatusIncomplete), // Initial status is "Incomplete" until the contract and assets are created
	}
	assert.NoError(t, db.Create(&study).Error)

	treEnv := types.Environment{
		Name: environments.TRE,
		Tier: 2,
	}
	require.NoError(t, db.Create(&treEnv).Error)

	asset := types.Asset{
		CreatorUserID: creator.ID,
		StudyID:       study.ID,
	}
	assert.NoError(t, db.Create(&asset).Error)

	mockUsers.On("UserByUsername", creator.Username).Return(&creator, nil)
	mockUsers.On("UserByUsername", user1.Username).Return(&user1, nil)

	mockUsers.
		On("UserIds", mock.Anything, mock.Anything).
		Return(
			map[types.Username]uuid.UUID{
				creator.Username: creator.ID,
				user1.Username:   user1.ID,
			},
			nil,
		)

	req := openapi.ProjectTRERequest{
		Name:                       "proj123",
		StudyId:                    study.ID.String(),
		AssetIds:                   []string{asset.ID.String()},
		NumRequiredEgressApprovals: 2,
		Members: []openapi.ProjectTREMember{
			{
				Username: string(creator.Username),
				Roles: []openapi.ProjectTRERoleName{
					openapi.TrustedEgresser,
				},
			},
			{
				Username: string(user1.Username),
				Roles: []openapi.ProjectTRERoleName{
					openapi.DesktopUser,
					openapi.Ingresser,
					openapi.APIUser,
				},
			},
		},
	}

	// execute
	err := svc.CreateProjectTRE(
		context.Background(),
		creator,
		study.ID,
		req,
	)
	require.NoError(t, err)

	var projectTRE types.ProjectTRE
	err = db.Preload("Project").Preload("TRERoleBindings.User").First(&projectTRE).Error
	require.NoError(t, err)

	assert.True(t, projectTRE.AirlockSSHEnabled) // airlock ssh expecteed to be always enabled
	assert.Equal(t, 2, projectTRE.EgressNumberRequiredApprovals)
	assert.Equal(t, types.ProjectTREStatusIncomplete, projectTRE.Status)

	// Assert relationships
	roles := projectTRE.TRERoleBindings
	assert.Equal(t, creator.Username, roles[0].User.Username)
	assert.Equal(t, user1.Username, roles[1].User.Username)
	assert.Equal(t, types.ProjectTRETrustedEgresser, roles[0].Role)
	assert.Equal(t, types.ProjectTREDesktopUser, roles[1].Role)

	project := projectTRE.Project
	assert.Equal(t, "proj123", project.Name)
	assert.Equal(t, creator.ID, project.CreatorUserID)
}
