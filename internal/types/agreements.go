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
	User        User      `gorm:"foreignKey:UserID"`
	UserID      uuid.UUID `gorm:"not null;index"`
	StudyID     uuid.UUID `gorm:"not null;index"`
	Agreement   Agreement `gorm:"foreignKey:AgreementID"`
	AgreementID uuid.UUID `gorm:"not null;index"`
}
