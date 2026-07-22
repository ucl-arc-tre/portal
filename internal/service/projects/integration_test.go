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
		&types.ProjectTREVMImage{},
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

func TestIntegration_GetProjectTREDetails(t *testing.T) {
	svc, study, creator, treEnv, _ := setupProjectTRETest(t)

	studyAdmin := types.StudyAdmin{
		StudyID: study.ID,
		UserID:  creator.ID,
	}
	require.NoError(t, svc.db.Create(&studyAdmin).Error)

	project := types.Project{
		Name:          "project123",
		StudyID:       study.ID,
		CreatorUserID: creator.ID,
		EnvironmentID: treEnv.ID,
	}
	require.NoError(t, svc.db.Create(&project).Error)

	requestedAt := time.Now().Truncate(time.Second)
	deployedAt := requestedAt.Add(128 * time.Minute)

	projectTRE := types.ProjectTRE{
		ProjectID:                     project.ID,
		EgressNumberRequiredApprovals: 2,
		ExternalEncryptionEnabled:     true,
		AirlockSSHEnabled:             true,
		AirlockWhitelist:              types.ProjectTREWhitelist{"example.com"},
		Status:                        types.ProjectTREStatusDeployed,
		MonthlyBudget:                 400,
		Platform:                      types.ProjectTREPlatformAWS,
		RequestedVersionUpdatedAt:     &requestedAt,
		DeployedVersionUpdatedAt:      &deployedAt,
	}
	require.NoError(t, svc.db.Create(&projectTRE).Error)

	roleBinding := types.ProjectTRERoleBinding{
		ProjectTREID: projectTRE.ID,
		UserID:       creator.ID,
		Role:         types.ProjectTREDesktopUser,
	}
	require.NoError(t, svc.db.Create(&roleBinding).Error)

	desktopImage := types.ProjectTREVMImage{
		Name:        "rhel10",
		ImageId:     "ami-123",
		Description: "Desktop image",
		Platform:    types.ProjectTREPlatformAWS,
	}
	require.NoError(t, svc.db.Create(&desktopImage).Error)

	userConfig := types.ProjectTREUserConfig{
		ProjectTREID:       projectTRE.ID,
		UserID:             creator.ID,
		UnixUsername:       "user1234",
		TrustedEgressCIDRs: []string{"100.200.100.16/30"},
		UID:                1001,
		DesktopImageID:     &desktopImage.ID,
	}
	require.NoError(t, svc.db.Create(&userConfig).Error)

	projectTREs, err := svc.AllProjectTREs()
	require.NoError(t, err)
	require.Len(t, projectTREs, 1)

	tre := projectTREs[0]

	assert.Equal(t, project.Name, tre.Project.Name)
	assert.Equal(t, creator.ID, tre.Project.CreatorUserID)
	assert.Equal(t, study.ID, tre.Project.StudyID)
	assert.Equal(t, treEnv.ID, tre.Project.EnvironmentID)

	assert.Equal(t, projectTRE.ID, tre.ID)
	assert.Equal(t, projectTRE.ProjectID, tre.ProjectID)
	assert.Equal(t, projectTRE.EgressNumberRequiredApprovals, tre.EgressNumberRequiredApprovals)
	assert.Equal(t, projectTRE.ExternalEncryptionEnabled, tre.ExternalEncryptionEnabled)
	assert.Equal(t, projectTRE.AirlockSSHEnabled, tre.AirlockSSHEnabled)
	assert.Equal(t, projectTRE.AirlockWhitelist, tre.AirlockWhitelist)
	assert.Equal(t, projectTRE.Status, tre.Status)
	assert.Equal(t, projectTRE.MonthlyBudget, tre.MonthlyBudget)
	assert.Equal(t, projectTRE.Platform, tre.Platform)
	require.NotNil(t, tre.RequestedVersionUpdatedAt)
	assert.Equal(t, requestedAt, *tre.RequestedVersionUpdatedAt)
	require.NotNil(t, tre.DeployedVersionUpdatedAt)
	assert.Equal(t, deployedAt, *tre.DeployedVersionUpdatedAt)

	assert.Equal(t, creator.Username, tre.Project.Study.Owner.Username)
	require.Len(t, tre.Project.Study.StudyAdmins, 1)
	assert.Equal(t, creator.Username, tre.Project.Study.StudyAdmins[0].User.Username)

	require.Len(t, tre.TRERoleBindings, 1)
	assert.Equal(t, types.ProjectTREDesktopUser, tre.TRERoleBindings[0].Role)
	assert.Equal(t, creator.Username, tre.TRERoleBindings[0].User.Username)

	require.Len(t, tre.UserConfigs, 1)
	assert.Equal(t, userConfig.UID, tre.UserConfigs[0].UID)
	assert.Equal(t, creator.Username, tre.UserConfigs[0].User.Username)
	assert.Equal(t, userConfig.UnixUsername, tre.UserConfigs[0].UnixUsername)
	assert.Equal(t, userConfig.TrustedEgressCIDRs, tre.UserConfigs[0].TrustedEgressCIDRs)
	require.NotNil(t, tre.UserConfigs[0].DesktopImage)
	assert.Equal(t, desktopImage.ImageId, tre.UserConfigs[0].DesktopImage.ImageId)
}

func TestIntegration_GetAllProjectTREs(t *testing.T) {
	svc, study, creator, treEnv, otherEnv := setupProjectTRETest(t)

	// Create TRE projects with possible statuses
	for _, status := range []types.ProjectTREStatus{
		types.ProjectTREStatusIncomplete,
		types.ProjectTREStatusPendingApproval,
		types.ProjectTREStatusPendingCreation,
		types.ProjectTREStatusDeployed,
		types.ProjectTREStatusPendingDeletion,
	} {
		createTREProject(t, svc.db, string(status)+"-project", study, creator, treEnv, status)
	}

	// Create and delete a TRE project
	deleted := createTREProject(t, svc.db, "Deleted", study, creator, treEnv, types.ProjectTREStatusDeleted)
	require.NoError(t, svc.db.Where("id = ?", deleted.ProjectID).Delete(&types.Project{}).Error)

	// Create a non-TRE project
	createNonTREProject(t, svc.db, study, creator, otherEnv, types.ProjectTREStatusDeployed)

	projectTREs, err := svc.AllProjectTREs()
	require.NoError(t, err)

	// Should return only TRE projects with PendingCreation/Deployed/PendingDeletion
	// statuses and are not deleted, so only 3 projects
	require.Len(t, projectTREs, 3)
	returnedStatuses := make([]types.ProjectTREStatus, 0, len(projectTREs))
	for _, tre := range projectTREs {
		returnedStatuses = append(returnedStatuses, tre.Status)
	}
	assert.Contains(t, returnedStatuses, types.ProjectTREStatusPendingCreation)
	assert.Contains(t, returnedStatuses, types.ProjectTREStatusDeployed)
	assert.Contains(t, returnedStatuses, types.ProjectTREStatusPendingDeletion)
}

func setupProjectTRETest(t *testing.T) (
	*Service,
	*types.Study,
	*types.User,
	*types.Environment,
	*types.Environment,
) {
	t.Helper()

	db := mockdb.NewTestDBSchema(t, migrate)
	graceful.SetDBForTesting(db)
	rbac.Init()

	svc := &Service{
		db: db,
	}

	creator := types.User{Username: "foo@testIntegration.com"}
	require.NoError(t, db.Create(&creator).Error)

	// TRE environment
	treEnv := types.Environment{
		Name: environments.TRE,
		Tier: 3,
	}
	require.NoError(t, db.Create(&treEnv).Error)

	// Non-TRE environment
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

	return svc, &study, &creator, &treEnv, &otherEnv
}

func createTREProject(
	t *testing.T,
	db *gorm.DB,
	name string,
	study *types.Study,
	creator *types.User,
	treEnv *types.Environment,
	status types.ProjectTREStatus,
) *types.ProjectTRE {
	t.Helper()

	project := types.Project{
		Name:          name,
		StudyID:       study.ID,
		CreatorUserID: creator.ID,
		EnvironmentID: treEnv.ID,
	}
	require.NoError(t, db.Create(&project).Error)

	projectTRE := types.ProjectTRE{
		ProjectID:                     project.ID,
		EgressNumberRequiredApprovals: 1,
		Status:                        status,
	}
	require.NoError(t, db.Create(&projectTRE).Error)
	return &projectTRE
}

func createNonTREProject(
	t *testing.T,
	db *gorm.DB,
	study *types.Study,
	creator *types.User,
	otherEnv *types.Environment,
	status types.ProjectTREStatus,
) {
	t.Helper()

	nonTREProject := types.Project{
		Name:          "nonTREproject",
		StudyID:       study.ID,
		CreatorUserID: creator.ID,
		EnvironmentID: otherEnv.ID,
	}
	require.NoError(t, db.Create(&nonTREProject).Error)

	nonTREProjectTRE := types.ProjectTRE{
		ProjectID:                     nonTREProject.ID,
		EgressNumberRequiredApprovals: 1,
		Status:                        status,
	}
	require.NoError(t, db.Create(&nonTREProjectTRE).Error)
}
