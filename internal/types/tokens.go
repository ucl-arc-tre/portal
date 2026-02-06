package types

import "github.com/google/uuid"

const (
	VerificationKeyKindEd25519 = "ed25519"
)

type VerificationKeyKind = string

type Token struct {
	ModelAuditable
	VerificationKeyID uuid.UUID `gorm:"not null;index"`

	// Relationships
	VerificationKey VerificationKey `gorm:"foreignKey:VerificationKeyID"`
}

type VerificationKey struct {
	ModelAuditable
	Kind  VerificationKeyKind `gorm:"not null;index"`
	Value []byte              `gorm:"not null"`
}
