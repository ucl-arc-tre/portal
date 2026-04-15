package types

import (
	"time"

	"github.com/google/uuid"
)

const (
	TrainingKindNHSD = TrainingKind("nhsd") // FIXED
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

func (t UserTrainingRecord) DaysUntilExpiry() int {
	return int(time.Since(t.CompletedAt).Hours()/24) - 365
}

func (t UserTrainingRecord) CertificateExpiringWithin30Days() *UserTrainingRecord {
	if t.DaysUntilExpiry() < 0 || t.DaysUntilExpiry() < 30 {
		return &t
	} else {
		return nil
	}

}
