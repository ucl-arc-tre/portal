package types

import "github.com/google/uuid"

type Username string

type ChosenName string

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
