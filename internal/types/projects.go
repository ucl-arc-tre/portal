package types

import (
	"github.com/google/uuid"
)

type Project struct {
	ModelAuditable
	Name           string    `gorm:"not null"`
	CreatorUserID  uuid.UUID `gorm:"not null;index"`
	StudyID        uuid.UUID `gorm:"index"`
	ApprovalStatus string    `gorm:"not null"`

	// Relationships
	Study         Study          `gorm:"foreignKey:StudyID"`
	CreatorUser   User           `gorm:"foreignKey:CreatorUserID"`
	ProjectAssets []ProjectAsset `gorm:"foreignKey:ProjectID"`
}

type ProjectTRE struct {
	ModelAuditable
	ProjectID                     uuid.UUID `gorm:"not null;index"`
	EnvironmentID                 uuid.UUID `gorm:"not null;index"`
	EgressNumberRequiredApprovals int       `gorm:"not null;default:1"`

	// Relationships
	Environment     Environment             `gorm:"foreignKey:EnvironmentID"`
	Project         Project                 `gorm:"foreignKey:ProjectID"`
	TRERoleBindings []ProjectTRERoleBinding `gorm:"foreignKey:ProjectTREID"`
}

type ProjectTRERoleName string

const (
	ProjectTREDesktopUser     ProjectTRERoleName = "desktop_user"     // allows access to a desktop
	ProjectTREIngresser       ProjectTRERoleName = "ingresser"        // can upload data into the TRE
	ProjectTREEgresser        ProjectTRERoleName = "egresser"         // can download data from the TRE
	ProjectTREEgressRequester ProjectTRERoleName = "egress_requester" // can request data to be egressed
	ProjectTREEgressChecker   ProjectTRERoleName = "egress_checker"   // can approve egress requests
)

var AllProjectTRERoles = []ProjectTRERoleName{
	ProjectTREDesktopUser,
	ProjectTREIngresser,
	ProjectTREEgresser,
	ProjectTREEgressRequester,
	ProjectTREEgressChecker,
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

type ProjectAsset struct {
	ModelAuditable
	ProjectID uuid.UUID `gorm:"not null;index"`
	AssetID   uuid.UUID `gorm:"not null;index"`

	// Relationships
	Project Project `gorm:"foreignKey:ProjectID"`
	Asset   Asset   `gorm:"foreignKey:AssetID"`
}
