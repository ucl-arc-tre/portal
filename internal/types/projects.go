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
	Project Project             `gorm:"foreignKey:ProjectID"`
	User    User                `gorm:"foreignKey:UserID"`
	Roles   []ProjectMemberRole `gorm:"foreignKey:ProjectMemberID"`
}

type ProjectMemberRole struct {
	Model
	ProjectMemberID uuid.UUID `gorm:"not null;index"`
	RoleID          uuid.UUID `gorm:"not null;index"`

	// Relationships
	ProjectMember ProjectMember `gorm:"foreignKey:ProjectMemberID"`
	Role          ProjectRole   `gorm:"foreignKey:RoleID"`
}

type ProjectRole struct {
	Model
	Name        string `gorm:"unique;not null"`
	Description string `gorm:"type:text"`
}

// Project role constants
const (
	ProjectRoleIngresser       = "ingresser"
	ProjectRoleEgresser        = "egresser"
	ProjectRoleEgressRequester = "egress_requester"
	ProjectRoleEgressChecker   = "egress_checker"
	ProjectRoleDesktopUser     = "desktop_user"
)
