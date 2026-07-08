//go:build integration

package projects

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	treopenapi "github.com/ucl-arc-tre/portal/internal/openapi/tre"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/service/environments"
	"github.com/ucl-arc-tre/portal/internal/service/notifications"
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
		&types.Notification{},
	)
	if err != nil {
		return err
	}

	return nil
}

func TestIntegration_UpdateProjectTREDeployedNotifiesCreator(t *testing.T) {
	db := mockdb.NewTestDBSchema(t, migrate)
	graceful.SetDBForTesting(db)

	creator := types.User{Username: "bob@testIntegration.com"}
	require.NoError(t, db.Create(&creator).Error)

	study := types.Study{
		OwnerUserID:                creator.ID,
		Title:                      "Study 123",
		DataControllerOrganisation: "UCL",
		ApprovalStatus:             types.StudyApprovalStatusIncomplete,
	}
	require.NoError(t, db.Create(&study).Error)

	treEnvironment := types.Environment{
		Name: environments.TRE,
		Tier: 2,
	}
	require.NoError(t, db.Create(&treEnvironment).Error)

	project := types.Project{
		Name:          "proj123",
		CreatorUserID: creator.ID,
		StudyID:       study.ID,
		EnvironmentID: treEnvironment.ID,
	}
	require.NoError(t, db.Create(&project).Error)

	projectTRE := types.ProjectTRE{
		ProjectID: project.ID,
		Status:    types.ProjectTREStatusPendingCreation,
	}
	require.NoError(t, db.Create(&projectTRE).Error)

	svc := &Service{
		db:            db,
		notifications: notifications.New(),
	}
	data := treopenapi.ProjectUpdate{
		Status:                   treopenapi.Deployed,
		DeployedVersionUpdatedAt: time.Now().UTC().Format(config.TimeFormat),
	}

	require.NoError(t, svc.UpdateProjectTREDeployed(project.Name, data))

	var notification types.Notification
	require.NoError(t, db.Where("recipient_user_id = ?", creator.ID).First(&notification).Error)
	assert.Equal(t, creator.ID, notification.RecipientUserID)
	assert.Equal(t, "'proj123' has been deployed", notification.Title)
	require.NotNil(t, notification.Kind)
	assert.Equal(t, types.NotificationKindProjectDeployed, *notification.Kind)
}

func TestIntegration_TestCreateProjectTRE(t *testing.T) {
	// Note: Remove t.Parallel() from RBAC-dependent integration tests

	// Create unique schema for this test
	db := mockdb.NewTestDBSchema(t, migrate)
	graceful.SetDBForTesting(db)
	rbac.Init()

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

func TestAllProjectTREs(t *testing.T) {
	db := mockdb.NewTestDBSchema(t, migrate)
	graceful.SetDBForTesting(db)
	rbac.Init()

	svc := &Service{
		db: db,
	}

	creator := types.User{Username: "bob@testIntegration.com"}
	require.NoError(t, db.Create(&creator).Error)

	treEnv := types.Environment{
		Name: environments.TRE,
		Tier: 3,
	}
	require.NoError(t, db.Create(&treEnv).Error)

	otherEnv := types.Environment{
		Name: "Not-a-TRE",
		Tier: 1,
	}
	require.NoError(t, db.Create(&otherEnv).Error)

	study := types.Study{
		OwnerUserID:    creator.ID,
		ApprovalStatus: string(openapi.ProjectTREStatusIncomplete),
	}
	require.NoError(t, db.Create(&study).Error)

	treProject := types.Project{
		Name:          "TREproject",
		CreatorUserID: creator.ID,
		StudyID:       study.ID,
		EnvironmentID: treEnv.ID,
	}
	require.NoError(t, db.Create(&treProject).Error)

	nonTREProject := types.Project{
		Name:          "nonTREproject",
		CreatorUserID: creator.ID,
		StudyID:       study.ID,
		EnvironmentID: otherEnv.ID,
	}
	require.NoError(t, db.Create(&nonTREProject).Error)

	deletedTREProject := types.Project{
		Name:          "deletedProject",
		CreatorUserID: creator.ID,
		StudyID:       study.ID,
		EnvironmentID: treEnv.ID,
	}
	require.NoError(t, db.Create(&deletedTREProject).Error)

	treProjectTRE := types.ProjectTRE{
		ProjectID:                     treProject.ID,
		EgressNumberRequiredApprovals: 1,
	}
	require.NoError(t, db.Create(&treProjectTRE).Error)

	nonTREProjectTRE := types.ProjectTRE{
		ProjectID:                     nonTREProject.ID,
		EgressNumberRequiredApprovals: 1,
	}
	require.NoError(t, db.Create(&nonTREProjectTRE).Error)

	deletedTREProjectTRE := types.ProjectTRE{
		ProjectID:                     deletedTREProject.ID,
		EgressNumberRequiredApprovals: 1,
	}
	require.NoError(t, db.Create(&deletedTREProjectTRE).Error)
	require.NoError(t, db.Delete(&deletedTREProject).Error)

	projectTREs, err := svc.AllProjectTREs()
	require.NoError(t, err)

	// Only 1 active TRE project should be returned
	require.Len(t, projectTREs, 1)
	assert.Equal(t, treProjectTRE.ID, projectTREs[0].ID)
	assert.Equal(t, treProject.ID, projectTREs[0].Project.ID)
	assert.Equal(t, "TREproject", projectTREs[0].Project.Name)
}
