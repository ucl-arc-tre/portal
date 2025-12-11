package types

import "github.com/google/uuid"

type AgreementType string

type Agreement struct {
	Model
	Type AgreementType
	Text string `gorm:"unique"`
}

type UserAgreementConfirmation struct {
	Model
	User        User
	UserID      uuid.UUID
	Agreement   Agreement
	AgreementID uuid.UUID
}

type StudyAgreementSignature struct {
	Model
	UserID      uuid.UUID `gorm:"not null;index"`
	StudyID     uuid.UUID `gorm:"not null;index"`
	AgreementID uuid.UUID `gorm:"not null;index"`

	// Relationships
	User      User      `gorm:"foreignKey:UserID"`
	Agreement Agreement `gorm:"foreignKey:AgreementID"`
}
