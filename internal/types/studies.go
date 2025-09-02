package types

import (
	"time"

	"github.com/google/uuid"
)

// for descriptions of the Study fields, see /api.web.yaml
type Study struct {
	ModelAuditable
	OwnerUserID                      uuid.UUID `gorm:"not null;index"`
	Title                            string    `gorm:"not null"`
	Description                      *string   `gorm:"type:text"`
	DataControllerOrganisation       string    `gorm:"not null"`
	InvolvesUclSponsorship           *bool     `gorm:""`
	InvolvesCag                      *bool     `gorm:""`
	CagReference                     *string   `gorm:"type:varchar(255)"`
	InvolvesEthicsApproval           *bool     `gorm:""`
	InvolvesHraApproval              *bool     `gorm:""`
	IrasId                           *string   `gorm:"type:varchar(255)"`
	IsNhsAssociated                  *bool     `gorm:""`
	InvolvesNhsEngland               *bool     `gorm:""`
	NhsEnglandReference              *string   `gorm:"type:varchar(255)"`
	InvolvesMnca                     *bool     `gorm:""`
	RequiresDspt                     *bool     `gorm:""`
	RequiresDbs                      *bool     `gorm:""`
	IsDataProtectionOfficeRegistered *bool     `gorm:""`
	DataProtectionNumber             *string   `gorm:"type:varchar(255)"`
	InvolvesThirdParty               *bool     `gorm:""`
	InvolvesExternalUsers            *bool     `gorm:""`
	InvolvesParticipantConsent       *bool     `gorm:""`
	InvolvesIndirectDataCollection   *bool     `gorm:""`
	InvolvesDataProcessingOutsideEea *bool     `gorm:""`
	ApprovalStatus                   string    `gorm:"not null"`

	// Relationships
	Owner       User         `gorm:"foreignKey:OwnerUserID"`
	Assets      []Asset      `gorm:"foreignKey:StudyID"`
	StudyAdmins []StudyAdmin `gorm:"foreignKey:StudyID"`
}

func (s Study) AdminUsernames() []string {
	usernames := []string{}
	for _, studyAdmin := range s.StudyAdmins {
		usernames = append(usernames, string(studyAdmin.User.Username))
	}
	return usernames
}

type StudyAdmin struct {
	ModelAuditable
	StudyID uuid.UUID `gorm:"not null;index"`
	UserID  uuid.UUID `gorm:"not null;index"`

	// Relationships
	Study Study `gorm:"foreignKey:StudyID"`
	User  User  `gorm:"foreignKey:UserID"`
}

type Asset struct {
	ModelAuditable
	CreatorUserID        uuid.UUID `gorm:"not null;index"`
	StudyID              uuid.UUID `gorm:"not null;index"`
	Title                string    `gorm:"not null"`
	Description          string    `gorm:"type:text;not null"`
	ClassificationImpact string    `gorm:"not null"`
	Protection           string    `gorm:"not null"`
	LegalBasis           string    `gorm:"not null"`
	Format               string    `gorm:"not null"`
	ExpiresAt            time.Time `gorm:"not null"`
	HasDspt              bool      `gorm:"not null;default:false"`
	StoredOutsideUkEea   bool      `gorm:"not null;default:false"`
	Status               string    `gorm:"not null"`

	// Relationships
	CreatorUser User            `gorm:"foreignKey:CreatorUserID"`
	Study       Study           `gorm:"foreignKey:StudyID"`
	Locations   []AssetLocation `gorm:"foreignKey:AssetID"`
}

func (a Asset) LocationStrings() []string {
	locationsStrings := []string{}
	for _, location := range a.Locations {
		locationsStrings = append(locationsStrings, location.Location)
	}
	return locationsStrings
}

type AssetLocation struct {
	Model
	AssetID  uuid.UUID `gorm:"not null;index"`
	Location string    `gorm:"not null"`

	// Relationships
	Asset Asset `gorm:"foreignKey:AssetID"`
}
