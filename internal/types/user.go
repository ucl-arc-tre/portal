package types

type Username string
type ChosenName string

type User struct {
	Model
	Username   Username `gorm:"uniqueIndex"`
	ChosenName ChosenName
}
