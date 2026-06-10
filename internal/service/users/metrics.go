package users

import (
	"github.com/ucl-arc-tre/portal/internal/config"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func (s *Service) Metrics() (*openapi.UserMetrics, error) {
	counts := struct {
		Total           int64 `gorm:"column:total"`
		ApprovedValid   int64 `gorm:"column:valid"`
		ApprovedInvalid int64 `gorm:"column:invalid"`
	}{}

	approvedResearchers := s.dbApprovedResearcherJoins().
		Select("users.id, MAX(user_training_records.completed_at) AS latest_training_completed_at").
		Group("users.id")

	result := s.db.Table("(?) AS approved_researchers", approvedResearchers).
		Select(
			"count(*) FILTER (WHERE latest_training_completed_at > (now() - interval '1 year' * ?)) AS valid, "+
				"count(*) FILTER (WHERE latest_training_completed_at <= (now() - interval '1 year' * ?)) AS invalid",
			config.TrainingValidityYears,
			config.TrainingValidityYears,
		).
		Scan(&counts)

	if result.Error != nil {
		return nil, types.NewErrFromGorm(result.Error, "failed to count trained users")
	}

	result = s.db.Model(&types.User{}).Count(&counts.Total)
	if result.Error != nil {
		return nil, types.NewErrFromGorm(result.Error, "failed to count users")
	}

	metrics := openapi.UserMetrics{
		Total:                                 int(counts.Total),
		NumApprovedResearchersValidTraining:   int(counts.ApprovedValid),
		NumApprovedResearchersExpiredTraining: int(counts.ApprovedInvalid),
	}
	return &metrics, nil
}
