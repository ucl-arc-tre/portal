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
	UserID      uuid.UUID
	AgreementID uuid.UUID
}
