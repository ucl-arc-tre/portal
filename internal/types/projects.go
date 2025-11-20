package types

import (
	"github.com/google/uuid"
)

type Project struct {
	ModelAuditable
	Name          string    `gorm:"not null"`
	CreatorUserID uuid.UUID `gorm:"not null;index"`
	StudyID       uuid.UUID `gorm:"index"`
	IsDraft       bool      `gorm:"not null;default:false"`

	// Relationships
	Study          Study           `gorm:"foreignKey:StudyID"`
	CreatorUser    User            `gorm:"foreignKey:CreatorUserID"`
	ProjectMembers []ProjectMember `gorm:"foreignKey:ProjectID"`
}

type ProjectTRE struct {
	ModelAuditable
	ProjectID                     uuid.UUID `gorm:"not null;index"`
	EnvironmentID                 uuid.UUID `gorm:"not null;index"`
	EgressNumberRequiredApprovals int       `gorm:"not null;default:1"`

	// Relationships
	Environment Environment `gorm:"foreignKey:EnvironmentID"`
	Project     Project     `gorm:"foreignKey:ProjectID"`
}

type ProjectMember struct {
	ModelAuditable
	ProjectID uuid.UUID `gorm:"not null;index"`
	UserID    uuid.UUID `gorm:"not null;index"`

	// Relationships
	Project         Project                 `gorm:"foreignKey:ProjectID"`
	User            User                    `gorm:"foreignKey:UserID"`
	TRERoleBindings []ProjectTRERoleBinding `gorm:"foreignKey:ProjectMemberID"`
}

type ProjectTRERoleName string

const (
	ProjectTREDesktopUser     ProjectTRERoleName = "desktop_user"     // allows access to a desktop
	ProjectTREIngresser       ProjectTRERoleName = "ingresser"        // can upload data into the TRE
	ProjectTREEgresser        ProjectTRERoleName = "egresser"         // can download data from the TRE
	ProjectTREEgressRequester ProjectTRERoleName = "egress_requester" // can request data to be egressed
	ProjectTREEgressChecker   ProjectTRERoleName = "egress_checker"   // can approve egress requests
)

type ProjectTRERoleBinding struct {
	ModelAuditable
	ProjectMemberID uuid.UUID          `gorm:"not null;index"`
	Role            ProjectTRERoleName `gorm:"not null;index"`

	// Relationships
	ProjectMember ProjectMember `gorm:"foreignKey:ProjectMemberID"`
}
