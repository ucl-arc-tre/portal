package types

type Username string

type User struct {
	Model
	Username Username `gorm:"uniqueIndex"`
}
