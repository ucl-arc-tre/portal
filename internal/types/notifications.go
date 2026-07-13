package types

import (
	"time"

	"github.com/google/uuid"
)

type NotificationKind string

const (
	NotificationKindCompleteProfile = NotificationKind("complete-profile")
	NotificationKindPendingStudy    = NotificationKind("pending-study")
	NotificationKindContractExpiry  = NotificationKind("contract-expiry")
	NotificationKindAssetExpiry     = NotificationKind("asset-expiry")
	NotificationKindTrainingExpiry  = NotificationKind("training-expiry")
	NotificationKindIaaAssignment   = NotificationKind("iaa-assignment")
	NotificationKindStdyAffirmation = NotificationKind("study-affirmation")
	NotificationKindStudyReview     = NotificationKind("study-review")
)

type Notification struct {
	Model
	RecipientUserID uuid.UUID `gorm:"index"`
	DedupeKey       string    `gorm:"not null;uniqueIndex"`
	Title           string    `gorm:"not null"`
	Kind            *NotificationKind
	Body            *string
	Href            *string // local link e.g. "/profile"
	ReadAt          *time.Time
	ExpiresAt       *time.Time
	EmailSentAt     *time.Time

	// Relationships
	Recipient User `gorm:"foreignKey:RecipientUserID"`
}
