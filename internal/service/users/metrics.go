package users

import (
	"github.com/ucl-arc-tre/portal/internal/config"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/service/agreements"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func (s *Service) Metrics() (*openapi.UserMetrics, error) {
	counts := struct {
		Total           int64 `gorm:"column:total"`
		ApprovedValid   int64 `gorm:"column:valid"`
		ApprovedInvalid int64 `gorm:"column:invalid"`
	}{}

	result := s.db.Model(&types.User{}).
		Joins("INNER JOIN user_agreement_confirmations ON users.id = user_id").
		Joins("INNER JOIN agreements ON user_agreement_confirmations.agreement_id = agreements.id").
		Joins("INNER JOIN user_training_records ON users.id = user_training_records.user_id").
		Where("agreements.type = ? AND user_training_records.kind = ?", agreements.ApprovedResearcherType, types.TrainingKindNHSD).
		Select(
			"count(case when user_training_records.completed_at > (now() - interval '1 year' * ?) then 1 end) as valid, "+
				"count(case when user_training_records.completed_at <= (now() - interval '1 year' * ?) then 1 end) as invalid",
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
