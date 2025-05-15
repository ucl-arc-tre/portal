package types

import "github.com/google/uuid"

type AgreementType string

type Agreement struct {
	Model
	Type AgreementType
	Text string `gorm:"unique"`
}

type UserAgreementConformation struct {
	Model
	User        User
	UserID      uuid.UUID
	Agreement   Agreement
	AgreementID uuid.UUID
}
