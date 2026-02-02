package types

import (
	"fmt"

	"github.com/google/uuid"
)

type Project struct {
	ModelAuditable
	Name           string    `gorm:"not null"`
	CreatorUserID  uuid.UUID `gorm:"not null;index"`
	StudyID        uuid.UUID `gorm:"index"`
	EnvironmentID  uuid.UUID `gorm:"not null;index"`
	ApprovalStatus string    `gorm:"not null"`

	// Relationships
	Study         Study          `gorm:"foreignKey:StudyID"`
	CreatorUser   User           `gorm:"foreignKey:CreatorUserID"`
	Environment   Environment    `gorm:"foreignKey:EnvironmentID"`
	ProjectAssets []ProjectAsset `gorm:"foreignKey:ProjectID"`
}

type ProjectTRE struct {
	ModelAuditable
	ProjectID                     uuid.UUID `gorm:"not null;index"`
	EgressNumberRequiredApprovals int       `gorm:"not null;default:1"`

	// Relationships
	Project         Project                 `gorm:"foreignKey:ProjectID"`
	TRERoleBindings []ProjectTRERoleBinding `gorm:"foreignKey:ProjectTREID"`
}

// TODO: Uncomment when DSH projects are implemented
// ProjectStatus represents the lifecycle status of a DSH project
// type ProjectStatus string
//
// const (
// 	ProjectStatusActive   ProjectStatus = "Active"
// 	ProjectStatusArchived ProjectStatus = "Archived"
// )
//
// type ProjectDSH struct {
// 	ModelAuditable
// 	ProjectID uuid.UUID     `gorm:"not null;index;uniqueIndex"`
// 	Status    ProjectStatus `gorm:"type:text;not null;default:'Active'"`
//
// 	// Relationships
// 	Project Project `gorm:"foreignKey:ProjectID"`
// }

type ProjectTRERoleName string

const (
	ProjectTREDesktopUser     ProjectTRERoleName = "desktop_user"     // allows access to a desktop
	ProjectTREIngresser       ProjectTRERoleName = "ingresser"        // can upload data into the TRE
	ProjectTREEgresser        ProjectTRERoleName = "egresser"         // can download data from the TRE
	ProjectTREEgressRequester ProjectTRERoleName = "egress_requester" // can request data to be egressed
	ProjectTREEgressChecker   ProjectTRERoleName = "egress_checker"   // can approve egress requests
	ProjectTRETrustedEgresser ProjectTRERoleName = "trusted_egresser" // can download data from the TRE without approval
)

var AllProjectTRERoles = []ProjectTRERoleName{
	ProjectTREDesktopUser,
	ProjectTREIngresser,
	ProjectTREEgresser,
	ProjectTREEgressRequester,
	ProjectTREEgressChecker,
	ProjectTRETrustedEgresser,
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
	return p.DeletedAt.Valid
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
	return p.DeletedAt.Valid
}
