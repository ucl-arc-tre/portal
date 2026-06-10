package types

import (
	"time"

	"github.com/google/uuid"
)

const (
	TrainingKindNHSD   = TrainingKind("nhsd")    // FIXED
	TrainingKindUCLHIg = TrainingKind("uclh_ig") // FIXED
)

type TrainingKind string

type UserTrainingRecord struct {
	Model
	UserID      uuid.UUID    `gorm:"not null;index"`
	Kind        TrainingKind `gorm:"index"`
	CompletedAt time.Time

	// Relationships
	User User `gorm:"foreignKey:UserID"`
}
