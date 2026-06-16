package types

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

// for descriptions of the Study fields, see /api/web.yaml
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
	Feedback                         *string   `gorm:"type:text"`
	LastSignoff                      *time.Time
	// caseref sequence starts at 10000 for portal studies while 0-9999 is reserved for legacy studies that will be migrated from sharepoint
	// study_caseref_seq defined in internal/graceful/db.go
	Caseref int `gorm:"uniqueIndex;default:nextval('study_caseref_seq')"` // auto inserts the next sequence on study submit

	// Relationships
	Owner           User                  `gorm:"foreignKey:OwnerUserID"`
	Assets          []Asset               `gorm:"foreignKey:StudyID"`
	StudyAdmins     []StudyAdmin          `gorm:"foreignKey:StudyID"`
	Contracts       []Contract            `gorm:"foreignKey:StudyID"`
	OwnerChangelogs []StudyOwnerChangelog `gorm:"foreignKey:StudyID"`
}

// Latest study owner changelog record. Optional
func (s Study) LatestOwnerChange() *StudyOwnerChangelog {
	var latest *StudyOwnerChangelog
	for _, o := range s.OwnerChangelogs {
		if latest == nil || o.CreatedAt.After(latest.CreatedAt) {
			latest = &o
		}
	}
	return latest
}

type StudyOwnerChangelogAction string

const (
	StudyOwnerChangelogActionRequest = "request"
	StudyOwnerChangelogActionApprove = "approve"
)

type StudyOwnerChangelog struct {
	Model
	StudyID    uuid.UUID                 `gorm:"not null;index"`
	UserID     uuid.UUID                 `gorm:"not null;index"` // User took the action
	FromUserID uuid.UUID                 `gorm:"not null;index"`
	ToUserID   uuid.UUID                 `gorm:"not null;index"`
	Action     StudyOwnerChangelogAction `gorm:"not null"`

	// Relationships
	Study    Study `gorm:"foreignKey:StudyID"`
	User     User  `gorm:"foreignKey:UserID"`
	FromUser User  `gorm:"foreignKey:FromUserID"`
	ToUser   User  `gorm:"foreignKey:ToUserID"`
}

// Queried via the DSH API
type DSHStudyExportRecord struct {
	Caseref        int
	OwnerUsername  Username
	AdminUsernames string // semicolon-separated in the returned data
}

func (s Study) AdminUsernames() []string {
	usernames := []string{}
	for _, studyAdmin := range s.StudyAdmins {
		usernames = append(usernames, string(studyAdmin.User.Username))
	}
	return usernames
}

func (s Study) NotificationRecipients() []string {
	recipients := []string{string(s.Owner.Username)}
	for _, studyAdmin := range s.StudyAdmins {
		recipients = append(recipients, string(studyAdmin.User.Username))
	}
	return recipients
}

type StudyAdmin struct {
	ModelAuditable
	StudyID uuid.UUID `gorm:"not null;index"`
	UserID  uuid.UUID `gorm:"not null;index"`

	// Relationships
	Study Study `gorm:"foreignKey:StudyID"`
	User  User  `gorm:"foreignKey:UserID"`
}

func (s StudyAdmin) IsDeleted() bool {
	return s.ModelAuditable.IsDeleted()
}

type AssetStatus = string

const (
	AssetStatusActive    = "active"
	AssetStatusDestroyed = "destroyed"
)

type Asset struct {
	ModelAuditable
	CreatorUserID                 uuid.UUID `gorm:"not null;index"`
	StudyID                       uuid.UUID `gorm:"not null;index"`
	Title                         string    `gorm:"not null"`
	Description                   string    `gorm:"type:text;not null"`
	ClassificationImpact          string    `gorm:"not null"`
	Tier                          int       `gorm:"not null;default:0"`
	Protection                    *string
	Format                        string `gorm:"not null"`
	ExpiresAt                     *time.Time
	RequiresContract              bool        `gorm:"not null;default:false"`
	HasDspt                       bool        `gorm:"not null;default:false"`
	StoredOutsideUkEea            bool        `gorm:"not null;default:false"`
	Status                        AssetStatus `gorm:"not null"`
	Source                        *string     // Data source location
	LegalBasis                    *string     // GDPR
	LegalBasisSpecial             *string     // Additional condition(s) for Special Category Data e.g. "Explicit consent"
	IsLeakMajorDisruption         *bool
	IsLeakMajorFinancialLoss      *bool
	IsLeakMajorReputationalDamage *bool
	RequiresTre                   *bool
	HasTargetedThreatActors       *bool

	// Relationships
	CreatorUser User            `gorm:"foreignKey:CreatorUserID"`
	Study       Study           `gorm:"foreignKey:StudyID"`
	Locations   []AssetLocation `gorm:"foreignKey:AssetID"`
	Contracts   []Contract      `gorm:"many2many:contract_assets;"`
	DataTypes   []AssetDataType `gorm:"foreignKey:AssetID"`
}

func (a Asset) LocationStrings() []string {
	locationsStrings := []string{}
	for _, location := range a.Locations {
		locationsStrings = append(locationsStrings, location.Location)
	}
	return locationsStrings
}

func (a Asset) IsDestroyed() bool {
	return a.Status == AssetStatusDestroyed
}

type AssetLocation struct {
	ModelAuditable
	AssetID  uuid.UUID `gorm:"not null;index"`
	Location string    `gorm:"not null"`

	// Relationships
	Asset Asset `gorm:"foreignKey:AssetID"`
}

func (a AssetLocation) UniqueKey() string {
	return fmt.Sprintf("%v%v", a.AssetID, a.Location)
}

func (a AssetLocation) IsDeleted() bool {
	return a.ModelAuditable.IsDeleted()
}

type AssetDataType struct {
	ModelAuditable
	AssetID uuid.UUID `gorm:"not null;index"`
	Name    string    `gorm:"not null"` // e.g. Research data

	// Relationships
	Asset Asset `gorm:"foreignKey:AssetID"`
}

func (a AssetDataType) UniqueKey() string {
	return fmt.Sprintf("%v%v", a.AssetID, a.Name)
}

func (a AssetDataType) IsDeleted() bool {
	return a.ModelAuditable.IsDeleted()
}

type ContractStatus = string

const (
	ContractStatusActive = ContractStatus("active")
	ContractStatusClosed = ContractStatus("closed")
)

// Contract represents a PDF contract document associated with an asset
type Contract struct {
	ModelAuditable
	StudyID          uuid.UUID  `gorm:"index"`
	CreatorUserID    uuid.UUID  `gorm:"type:uuid;not null"`
	SignatoryUserId  *uuid.UUID `gorm:"type:uuid"`
	Title            string
	ThirdPartyName   *string
	OtherSignatories *string // free text: could be name(s), email(s), UPN(s), organisations
	Status           ContractStatus
	StartDate        *time.Time
	ExpiryDate       *time.Time
	RetentionEndDate *time.Time

	// Relationships
	Study         Study                    `gorm:"foreignKey:StudyID"`
	CreatorUser   User                     `gorm:"foreignKey:CreatorUserID"`
	SignatoryUser User                     `gorm:"foreignKey:SignatoryUserId"`
	Assets        []Asset                  `gorm:"many2many:contract_assets;"` // autogen the contract_assets table
	Objects       []ContractObjectMetadata `gorm:"foreignKey:ContractID"`
}

// Contract object is the metadata for a file object {pdf, docx} etc.
type ContractObjectMetadata struct {
	ModelAuditable
	Filename   string    `gorm:"not null"`
	ContractID uuid.UUID `gorm:"type:uuid;not null"`

	// Relationships
	Contract Contract
}
