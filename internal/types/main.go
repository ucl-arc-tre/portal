package types

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Model struct {
	ID        uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4()"`
	CreatedAt time.Time
}

type ModelAutitable struct {
	Model
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}
