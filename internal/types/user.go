package types

type User struct {
	Model
	Username string `gorm:"uniqueIndex"`
}
