package tre

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func TestToApiProjectResponse(t *testing.T) {
	homeVolumeGB1 := types.GB(64)
	homeVolumeGB2 := types.GB(80)
	stdInstanceType1 := types.ProjectTREDesktopInstanceType("t3a.medium")
	stdInstanceType2 := types.ProjectTREDesktopInstanceType("t3a.small")
	hpcInstanceType := types.ProjectTREDesktopInstanceType("g6.12xlarge")

	revisionAt := time.Date(2026, 7, 16, 14, 4, 32, 0, time.UTC)

	projectTRE := types.ProjectTRE{
		Project: types.Project{
			Name: "treProject1",
			Study: types.Study{
				Owner: types.User{
					Username: "owner@example.com",
				},
				StudyAdmins: []types.StudyAdmin{
					{
						User: types.User{
							Username: "admin@example.com",
						},
					},
				},
			},
		},
		Platform:                      types.ProjectTREPlatformAWS,
		MonthlyBudget:                 200,
		ExternalEncryptionEnabled:     true,
		EgressNumberRequiredApprovals: 1,
		AirlockSSHEnabled:             true,
		AirlockWhitelist: types.ProjectTREWhitelist{
			"example.com",
			"104.18.18.104",
		},
		UserConfigs: []types.ProjectTREUserConfig{
			{
				User: types.User{
					Username: "user1@example.com",
				},
				UID: 1001,
				DesktopImage: &types.ProjectTREVMImage{
					ImageId: "ami-0001",
				},
				DesktopHomeVolumeSize:       &homeVolumeGB1,
				DesktopStandardInstanceType: &stdInstanceType1,
				DesktopHPCInstanceType:      &hpcInstanceType,
			},
			{
				User: types.User{
					Username: "user2@example.com",
				},
				UID: 1002,
				DesktopImage: &types.ProjectTREVMImage{
					ImageId: "ami-0002",
				},
				DesktopHomeVolumeSize:       &homeVolumeGB2,
				DesktopStandardInstanceType: &stdInstanceType2,
				DesktopHPCInstanceType:      nil,
			},
		},
		TRERoleBindings: []types.ProjectTRERoleBinding{
			{
				User: types.User{
					Username: "user1@example.com",
				},
				Role: types.ProjectTREIngresser,
			},
			{
				User: types.User{
					Username: "user1@example.com",
				},
				Role: types.ProjectTREEgressRequester,
			},
			{
				User: types.User{
					Username: "user1@example.com",
				},
				Role: types.ProjectTREEgressChecker,
			},
			{
				User: types.User{
					Username: "user2@example.com",
				},
				Role: types.ProjectTREEgressChecker,
			},
			{
				User: types.User{
					Username: "user1@example.com",
				},
				Role: types.ProjectTREEgresser,
			},
			{
				User: types.User{
					Username: "user2@example.com",
				},
				Role: types.ProjectTREEgresser,
			},
			{
				User: types.User{
					Username: "user1@example.com",
				},
				Role: types.ProjectTREDesktopUser,
			},
			{
				User: types.User{
					Username: "user2@example.com",
				},
				Role: types.ProjectTREDesktopUser,
			},
			{
				User: types.User{
					Username: "user1@example.com",
				},
				Role: types.ProjectTREAPIUser,
			},
		},
		RequestedVersionUpdatedAt: &revisionAt,
	}

	response := toApiProjectResponse(projectTRE)

	// Project
	assert.Equal(t, "treProject1", response.Name)
	assert.Equal(t, "aws", response.Platform)
	assert.Equal(t, float32(200), response.MonthlyBudget)
	assert.Equal(t, 1, response.EgressNumberRequiredApprovals)
	assert.True(t, response.EncryptionKeyEnabled)

	// Airlock
	assert.True(t, response.Airlock.HttpEnabled)
	assert.True(t, response.Airlock.SftpEnabled)
	assert.True(t, response.Airlock.SshEnabled)
	assert.Equal(t, 2, len(response.Airlock.Whitelist))
	assert.Contains(t, response.Airlock.Whitelist, "example.com")
	assert.Contains(t, response.Airlock.Whitelist, "104.18.18.104")

	// Owners
	assert.Equal(t, 2, len(response.Owners))
	assert.Contains(t, response.Owners, "owner@example.com")
	assert.Contains(t, response.Owners, "admin@example.com")

	// Usernames
	assert.Equal(t, 2, len(response.Usernames))
	assert.Equal(t, "user1", response.Usernames["user1@example.com"])
	assert.Equal(t, "user2", response.Usernames["user2@example.com"])

	// Uids
	assert.Equal(t, 2, len(response.Uids))
	assert.Equal(t, 1001, response.Uids["user1@example.com"])
	assert.Equal(t, 1002, response.Uids["user2@example.com"])

	// Uploaders
	assert.Equal(t, 1, len(response.Uploaders))
	assert.Contains(t, response.Uploaders, "user1@example.com")

	// Egress Requesters
	assert.Equal(t, 1, len(response.EgressRequesters))
	assert.Contains(t, response.EgressRequesters, "user1@example.com")

	// Egress Checkers
	assert.Equal(t, 2, len(response.EgressCheckers))
	assert.Contains(t, response.EgressCheckers, "user1@example.com")
	assert.Contains(t, response.EgressCheckers, "user2@example.com")

	// Downloaders
	assert.Equal(t, 2, len(response.Downloaders))
	assert.Contains(t, response.Downloaders, "user1@example.com")
	assert.Contains(t, response.Downloaders, "user2@example.com")

	// Desktop Users
	assert.Equal(t, 2, len(response.DesktopUsers))
	assert.Contains(t, response.DesktopUsers, "user1@example.com")
	assert.Contains(t, response.DesktopUsers, "user2@example.com")

	// Api Users
	assert.Equal(t, 1, len(response.ApiUsers))
	assert.Contains(t, response.ApiUsers, "user1@example.com")

	// Desktop instance types
	assert.Equal(t, 2, len(response.DesktopInstanceTypes))
	assert.Equal(t, "ami-0001", response.DesktopInstanceTypes["user1@example.com"].Image)
	assert.Equal(t, 64, *response.DesktopInstanceTypes["user1@example.com"].HomeVolumeGb)
	assert.Equal(t, "t3a.medium", response.DesktopInstanceTypes["user1@example.com"].Standard)
	assert.Equal(t, "g6.12xlarge", response.DesktopInstanceTypes["user1@example.com"].Hpc)

	assert.Equal(t, "ami-0002", response.DesktopInstanceTypes["user2@example.com"].Image)
	assert.Equal(t, 80, *response.DesktopInstanceTypes["user2@example.com"].HomeVolumeGb)
	assert.Equal(t, "t3a.small", response.DesktopInstanceTypes["user2@example.com"].Standard)
	assert.Equal(t, "", response.DesktopInstanceTypes["user2@example.com"].Hpc)

	// Requested revision
	assert.Equal(t, "2026-07-16T14:04:32Z", response.RequestedVersionUpdatedAt)
}
