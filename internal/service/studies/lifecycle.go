package studies

import (
	"time"

	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/types"
)

// Active: the study has been affirmed (signed off) and that affirmation hasn't gone stale.
// Inactive: the default - covers studies never affirmed (e.g. still Incomplete, never
// marked ready for review) and studies whose affirmation has gone stale.
func (s *Service) DetermineStudyLifecycle(study types.Study) types.StudyLifecycleStatus {
	if studyHasCurrentAffirmation(study) {
		return types.StudyLifecycleStatusActive
	}
	return types.StudyLifecycleStatusInactive
}

func studyHasCurrentAffirmation(study types.Study) bool {
	if study.LastSignoff == nil {
		return false
	}
	return time.Since(*study.LastSignoff) < config.StudyLifecycleAffirmationValidity
}
