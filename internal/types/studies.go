package types

import (
	"mime/multipart"
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
	RequiresContract     bool      `gorm:"not null;default:false"`
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

// Contract represents a PDF contract document associated with an asset
type Contract struct {
	ModelAuditable
	StudyID               uuid.UUID `gorm:"not null;index"`
	AssetID               uuid.UUID `gorm:"not null;index"`
	ContractID            uuid.UUID `gorm:"type:uuid;not null;unique;index"` // Used as S3 key
	Filename              string    `gorm:"not null"`
	UploadedBy            uuid.UUID `gorm:"type:uuid;not null"`
	OrganisationSignatory string
	ThirdPartyName        string
	Status                string // proposed, active, expired
	ExpiryDate            time.Time

	// Relationships
	Study Study `gorm:"foreignKey:StudyID"`
	Asset Asset `gorm:"foreignKey:AssetID"`
	User  User  `gorm:"foreignKey:UploadedBy"`
}

// used for parsing multipart form data when uploading a contract (before it is stored)
type ContractFormData struct {
	OrganisationSignatory string                `form:"organisation_signatory"`
	ThirdPartyName        string                `form:"third_party_name"`
	Status                string                `form:"status"`
	ExpiryDate            string                `form:"expiry_date"`
	File                  *multipart.FileHeader `form:"file"`
}
