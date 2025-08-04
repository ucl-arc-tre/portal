package types

import "github.com/google/uuid"

type Username string // e.g. ccxyz@ucl.ac.uk

type ChosenName string // e.g. Alice Smith

type User struct {
	Model
	Username Username `gorm:"uniqueIndex"`
}

type UserAttributes struct {
	Model
	User       User
	UserID     uuid.UUID
	ChosenName ChosenName
}

type Sponsor struct {
	Username   Username
	ChosenName ChosenName
	UserID     uuid.UUID
}

type UserSponsorship struct {
	Model
	UserID    uuid.UUID
	SponsorID uuid.UUID
}
