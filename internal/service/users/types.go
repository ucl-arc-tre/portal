package users

import (
	"time"

	"github.com/ucl-arc-tre/portal/internal/types"
)

type ApprovedResearcherImportRecord struct {
	Username                types.Username
	AgreedToAgreement       bool
	NHSDTrainingCompletedAt *time.Time
}

type ApprovedResearcherExportRecord struct {
	Username                types.Username `gorm:"column:username"`
	AgreedToAgreementAt     time.Time      `gorm:"column:agreed_at"`
	NHSDTrainingCompletedAt time.Time      `gorm:"column:training_complete_at"`
}
