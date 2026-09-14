package audit

import (
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

func LogStudyFeedback(tx *gorm.DB, user types.User, study *types.StudyFeedback) error {
	// todo
	return nil
}
