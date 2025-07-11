package types

import (
	"github.com/google/uuid"
)

type Study struct {
	ModelAuditable
	OwnerUserID uuid.UUID `gorm:"not null;index"`
	Title       string    `gorm:"not null"`
	Description string    `gorm:"type:text"`

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
