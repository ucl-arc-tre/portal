package users

import (
	"time"

	"github.com/ucl-arc-tre/portal/internal/types"
)

type Email = string

type ApprovedResearcherImportRecord struct {
	Username                types.Username
	AgreedToAgreement       bool
	NHSDTrainingCompletedAt *time.Time
}
