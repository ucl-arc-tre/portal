package studies

import (
	"slices"
	"time"

	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/types"
)

// Sets the derived LifecycleStatus on each study
func (s *Service) populateLifecycleStatuses(studies []types.Study) error {
	approvedStudyIds := []uuid.UUID{}
	for _, study := range studies {
		if study.ApprovalStatus == types.StudyApprovalStatusApproved {
			approvedStudyIds = append(approvedStudyIds, study.ID)
		}
	}

	studyIdsWithActiveProjects := []uuid.UUID{}
	studyIdsWithRetainedAssets := []uuid.UUID{}
	if len(approvedStudyIds) > 0 {
		err := s.db.Model(&types.Project{}).
			Joins("LEFT JOIN project_tres ON project_tres.project_id = projects.id AND project_tres.deleted_at IS NULL").
			Joins("LEFT JOIN project_dshes ON project_dshes.project_id = projects.id AND project_dshes.deleted_at IS NULL").
			Where("projects.study_id IN ?", approvedStudyIds).
			// DSH projects currently only have an active status
			Where("(project_tres.status != ? OR project_dshes.status = ?)", types.ProjectTREStatusDeleted, types.ProjectDSHStatusActive).
			Distinct().
			Pluck("projects.study_id", &studyIdsWithActiveProjects).Error
		if err != nil {
			return types.NewErrFromGorm(err, "failed to get studies with active projects")
		}

		err = s.db.Model(&types.Asset{}).
			Where("study_id IN ?", approvedStudyIds).
			Where("status != ?", types.AssetStatusDestroyed).
			Where("(expires_at IS NULL OR expires_at > ?)", time.Now()).
			Distinct().
			Pluck("study_id", &studyIdsWithRetainedAssets).Error
		if err != nil {
			return types.NewErrFromGorm(err, "failed to get studies with retained assets")
		}
	}

	for i := range studies {
		studies[i].LifecycleStatus = determineStudyLifecycle(
			studies[i],
			slices.Contains(studyIdsWithActiveProjects, studies[i].ID),
			slices.Contains(studyIdsWithRetainedAssets, studies[i].ID),
		)
	}
	return nil
}

// Closed: an approved study with no active projects, where every asset is either destroyed or past its expiry.
// Active: an approved study whose affirmation (sign off) hasn't gone stale.
// Inactive: the default - covers studies not yet approved (e.g. Incomplete, Pending or Rejected)
// and approved studies whose affirmation has gone stale.
func determineStudyLifecycle(study types.Study, hasActiveProjects bool, hasRetainedAssets bool) types.StudyLifecycleStatus {
	if study.ApprovalStatus != types.StudyApprovalStatusApproved {
		return types.StudyLifecycleStatusInactive
	}
	if !hasActiveProjects && !hasRetainedAssets {
		return types.StudyLifecycleStatusClosed
	}
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
