package types

import (
	"regexp"

	"github.com/google/uuid"
)

var (
	usernameRegex = regexp.MustCompile(`^[^@]+@[^@]+\.[^@]+$`)
)

type Username string // e.g. ccxyz@ucl.ac.uk

func (u Username) IsValid() bool {
	return usernameRegex.MatchString(string(u))
}

type ChosenName string // e.g. Alice Smith

type User struct {
	Model
	Username Username `gorm:"uniqueIndex"`
}

type UserAttributes struct {
	Model
	UserID     uuid.UUID
	ChosenName ChosenName
	Email      string // Should be set for external users

	// Relationships
	User User `gorm:"foreignKey:UserID"`
}

type Sponsor struct {
	Username   Username
	ChosenName ChosenName
}

type UserSponsorship struct {
	Model
	UserID    uuid.UUID `gorm:"foreignKey:UserID"`
	SponsorID uuid.UUID `gorm:"foreignKey:UserID"`
}
