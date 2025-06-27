package types

import (
	"time"

	"github.com/google/uuid"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
)

const (
	TrainingKindNHSD = TrainingKind(openapi.Nhsd)
)

type TrainingKind string

type UserTrainingRecord struct {
	Model
	UserID      uuid.UUID
	Kind        TrainingKind `gorm:"index"`
	CompletedAt time.Time
}
