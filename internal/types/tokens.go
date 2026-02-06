package types

import (
	"time"

	"github.com/google/uuid"
)

const (
	VerificationKeyKindEd25519 = VerificationKeyKind("ed25519")
)

type VerificationKeyKind string

type Token struct {
	ModelAuditable
	Name      string    `gorm:"not null"`
	ExpiresAt time.Time `gorm:"not null"`

	EnvironmentID     uuid.UUID
	VerificationKeyID uuid.UUID `gorm:"not null;index"`
	CreatorUserID     uuid.UUID `gorm:"not null;index"`

	// Relationships
	CreatorUser     User                 `gorm:"foreignKey:CreatorUserID"`
	VerificationKey TokenVerificationKey `gorm:"foreignKey:VerificationKeyID"`
	Environment     Environment          `gorm:"foreignKey:EnvironmentID"`
}

type TokenVerificationKey struct {
	ModelAuditable
	Kind        VerificationKeyKind `gorm:"not null;index"`
	ValueBase64 string              `gorm:"not null"`
}
