package types

import (
	"time"

	"github.com/google/uuid"
)

const (
	TrainingKindNHSD = TrainingKind("nhsd")
)

type TrainingKind string

type UserTrainingRecord struct {
	Model
	UserID      uuid.UUID
	Kind        TrainingKind `gorm:"index"`
	CompletedAt time.Time
}
