package types

import (
	"github.com/google/uuid"
)

type Study struct {
	ModelAuditable
	OwnerUserID          uuid.UUID `gorm:"not null;index"`
	Title                string    `gorm:"not null"`
	Description          *string   `gorm:"type:text"`
	Admin                *string   `gorm:"type:varchar(255)"`
	Controller           string    `gorm:"not null"`
	ControllerOther      *string   `gorm:"type:varchar(255)"`
	UclSponsorship       *bool     `gorm:""`
	Cag                  *bool     `gorm:""`
	CagRef               *string   `gorm:"type:varchar(255)"`
	Ethics               *bool     `gorm:""`
	Hra                  *bool     `gorm:""`
	IrasId               *string   `gorm:"type:varchar(255)"`
	Nhs                  *bool     `gorm:""`
	NhsEngland           *bool     `gorm:""`
	NhsEnglandRef        *string   `gorm:"type:varchar(255)"`
	Mnca                 *bool     `gorm:""`
	Dspt                 *bool     `gorm:""`
	Dbs                  *bool     `gorm:""`
	DataProtection       *bool     `gorm:""`
	DataProtectionPrefix *string   `gorm:"type:varchar(255)"`
	DataProtectionDate   *string   `gorm:"type:varchar(255)"`
	DataProtectionId     *int      `gorm:""`
	DataProtectionNumber *string   `gorm:"type:varchar(255)"`
	ThirdParty           *bool     `gorm:""`
	ExternalUsers        *bool     `gorm:""`
	Consent              *bool     `gorm:""`
	NonConsent           *bool     `gorm:""`
	ExtEea               *bool     `gorm:""`

	// Relationships
	Owner  User    `gorm:"foreignKey:OwnerUserID"`
	Assets []Asset `gorm:"foreignKey:StudyID"`
}

type Asset struct {
	ModelAuditable
	StudyID                uuid.UUID `gorm:"not null;index"`
	Title                  string    `gorm:"not null"`
	Description            string    `gorm:"type:text;not null"`
	ClassificationImpact   string    `gorm:"not null"`
	Protection             string    `gorm:"not null"`
	LegalBasis             string    `gorm:"not null"`
	Format                 string    `gorm:"not null"`
	Expiry                 string    `gorm:"not null"`
	HasDspt                bool      `gorm:"not null;default:false"`
	StoredOutsideUkEea     bool      `gorm:"not null;default:false"`
	AccessedByThirdParties bool      `gorm:"not null;default:false"`
	ThirdPartyAgreement    string    `gorm:""`
	Status                 string    `gorm:"not null"`

	// Relationships
	Study     Study           `gorm:"foreignKey:StudyID"`
	Locations []AssetLocation `gorm:"foreignKey:AssetID"`
}

type AssetLocation struct {
	Model
	AssetID  uuid.UUID `gorm:"not null;index"`
	Location string    `gorm:"not null"`

	// Relationships
	Asset Asset `gorm:"foreignKey:AssetID"`
}
