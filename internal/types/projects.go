package types

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

type Project struct {
	ModelAuditable
	Name          string    `gorm:"not null"`
	CreatorUserID uuid.UUID `gorm:"not null;index"`
	StudyID       uuid.UUID `gorm:"index"`
	EnvironmentID uuid.UUID `gorm:"not null;index"`

	// Relationships
	Study         Study          `gorm:"foreignKey:StudyID"`
	CreatorUser   User           `gorm:"foreignKey:CreatorUserID"`
	Environment   Environment    `gorm:"foreignKey:EnvironmentID"`
	ProjectAssets []ProjectAsset `gorm:"foreignKey:ProjectID"`
}

type Dollars = int

type ProjectTRE struct {
	ModelAuditable
	ProjectID                     uuid.UUID           `gorm:"not null;index"`
	EgressNumberRequiredApprovals int                 `gorm:"not null;default:1"`
	ExternalEncryptionEnabled     bool                `gorm:"not null;default:false"`
	AirlockSSHEnabled             bool                `gorm:"not null;default:true"`
	AirlockWhitelist              ProjectTREWhitelist `gorm:"serializer:json"`
	Status                        ProjectTREStatus    `gorm:"not null;default:'incomplete'"`
	MonthlyBudget                 Dollars             `gorm:"not null;default:100"`
	Platform                      ProjectTREPlatform  `gorm:"not null;default:'aws'"`

	// Version of the project which has been requested
	RequestedVersionUpdatedAt *time.Time

	// Version of the project that has been deployed. i.e.
	// nil => project has not been deployed
	// RequestedVersionUpdatedAt == DeployedVersionUpdatedAt =>  project deploy is up to date
	// RequestedVersionUpdatedAt.After(DeployedVersionUpdatedAt) => project is awaiting new version being deployed
	DeployedVersionUpdatedAt *time.Time

	// Relationships
	Project         Project                 `gorm:"foreignKey:ProjectID"`
	TRERoleBindings []ProjectTRERoleBinding `gorm:"foreignKey:ProjectTREID"`
	UserConfigs     []ProjectTREUserConfig  `gorm:"foreignKey:ProjectTREID"`
}

type (
	Host                = string // e.g. "127.0.0.1" or "example.com"
	ProjectTREWhitelist []Host
)

type ProjectTREPlatform string

const (
	ProjectTREPlatformAWS       ProjectTREPlatform = "aws"
	ProjectTREPlatformCondenser ProjectTREPlatform = "condenser"
)

var ProjectTREPlatforms = []ProjectTREPlatform{ProjectTREPlatformAWS, ProjectTREPlatformCondenser}

type ProjectTREVMImage struct {
	ModelAuditable
	Name        string             `gorm:"not null"`
	ImageId     string             `gorm:"not null;index:idx_id_platform,unique"` // e.g. AMI id
	Description string             `gorm:"not null"`
	Platform    ProjectTREPlatform `gorm:"not null;index:idx_id_platform,unique"`
}

type ProjectTREStatus string

const (
	ProjectTREStatusIncomplete      ProjectTREStatus = "incomplete"       // Awaiting user submission
	ProjectTREStatusPendingApproval ProjectTREStatus = "pending-approval" // Awaiting approval from TRE ops staff
	ProjectTREStatusPendingCreation ProjectTREStatus = "pending-creation" // Approved awaiting creation
	ProjectTREStatusDeployed        ProjectTREStatus = "deployed"         // Deployed and available to use
	ProjectTREStatusPendingDeletion ProjectTREStatus = "pending-deletion" // Requested delete but not yet deleted
	ProjectTREStatusDeleted         ProjectTREStatus = "deleted"          // Project and all its data has been deleted
)

type ProjectTRERoleName string

const (
	ProjectTREDesktopUser     ProjectTRERoleName = "desktop_user"     // allows access to a desktop
	ProjectTREIngresser       ProjectTRERoleName = "ingresser"        // can upload data into the TRE
	ProjectTREEgresser        ProjectTRERoleName = "egresser"         // can download data from the TRE
	ProjectTREEgressRequester ProjectTRERoleName = "egress_requester" // can request data to be egressed
	ProjectTREEgressChecker   ProjectTRERoleName = "egress_checker"   // can approve egress requests
	ProjectTRETrustedEgresser ProjectTRERoleName = "trusted_egresser" // can download data from the TRE without approval
	ProjectTREAPIUser         ProjectTRERoleName = "API_user"         // can upload data through the TRE API
)

var AllProjectTRERoles = []ProjectTRERoleName{
	ProjectTREDesktopUser,
	ProjectTREIngresser,
	ProjectTREEgresser,
	ProjectTREEgressRequester,
	ProjectTREEgressChecker,
	ProjectTRETrustedEgresser,
	ProjectTREAPIUser,
}

type ProjectTRERoleBinding struct {
	ModelAuditable
	ProjectTREID uuid.UUID          `gorm:"not null;index"`
	UserID       uuid.UUID          `gorm:"not null;index"`
	Role         ProjectTRERoleName `gorm:"not null;index"`

	// Relationships
	ProjectTRE ProjectTRE `gorm:"foreignKey:ProjectTREID"`
	User       User       `gorm:"foreignKey:UserID"`
}

func (p ProjectTRERoleBinding) UniqueKey() string {
	return fmt.Sprintf("%v%v%v", p.ProjectTREID, p.UserID, p.Role)
}

func (p ProjectTRERoleBinding) IsDeleted() bool {
	return p.ModelAuditable.IsDeleted()
}

type GB = uint

type ProjectTREDesktopInstanceType = string // e.g. t3a.small

type ProjectTREUserConfig struct {
	ModelAuditable
	ProjectTREID                uuid.UUID `gorm:"not null;index"`
	UserID                      uuid.UUID `gorm:"not null;index"`
	UID                         int       `gorm:"not null"`
	DesktopImageID              *uuid.UUID
	DesktopRootVolumeSize       *GB
	DesktopHomeVolumeSize       *GB
	DesktopStandardInstanceType *ProjectTREDesktopInstanceType
	DesktopHPCInstanceType      *ProjectTREDesktopInstanceType

	// Relationships
	DesktopImage *ProjectTREVMImage `gorm:"foreignKey:DesktopImageID"`
	ProjectTRE   ProjectTRE         `gorm:"foreignKey:ProjectTREID"`
	User         User               `gorm:"foreignKey:UserID"`
}

func (p ProjectTREUserConfig) UniqueKey() string {
	return fmt.Sprintf("%v%v", p.ProjectTREID, p.UserID)
}

func (p ProjectTREUserConfig) IsDeleted() bool {
	return p.ModelAuditable.IsDeleted()
}

type ProjectAsset struct {
	ModelAuditable
	ProjectID uuid.UUID `gorm:"not null;index"`
	AssetID   uuid.UUID `gorm:"not null;index"`

	// Relationships
	Project Project `gorm:"foreignKey:ProjectID"`
	Asset   Asset   `gorm:"foreignKey:AssetID"`
}

func (p ProjectAsset) UniqueKey() string {
	return fmt.Sprintf("%v%v", p.ProjectID, p.AssetID)
}

func (p ProjectAsset) IsDeleted() bool {
	return p.ModelAuditable.IsDeleted()
}
