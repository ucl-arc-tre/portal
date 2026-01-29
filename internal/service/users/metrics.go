package users

import (
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/service/agreements"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

// openapi.UserMetrics{}

func (s *Service) Metrics() (*openapi.UserMetrics, error) {
	var total int64
	result := s.db.Model(&types.User{}).Count(&total)
	if result.Error != nil {
		return nil, types.NewErrFromGorm(result.Error, "failed to count users")
	}

	var countValid int64
	result = s.txUserJoinsAgreementsTraining().
		Where("agreements.type = ? AND user_training_records.kind = ? AND user_training_records.completed_at > now() - interval '1 year'", agreements.ApprovedResearcherType, types.TrainingKindNHSD).
		Count(&countValid)
	if result.Error != nil {
		return nil, types.NewErrFromGorm(result.Error, "failed to count valid AR users")
	}

	var countInValid int64
	result = s.txUserJoinsAgreementsTraining().
		Where("agreements.type = ? AND user_training_records.kind = ? AND user_training_records.completed_at < now() - interval '1 year'", agreements.ApprovedResearcherType, types.TrainingKindNHSD).
		Count(&countInValid)
	if result.Error != nil {
		return nil, types.NewErrFromGorm(result.Error, "failed to count invalid AR users")
	}

	metrics := openapi.UserMetrics{
		Total:                                int(total),
		NumApprovedResearchersValidTraining:  int(countValid),
		NumApprovedResearcherExpiredTraining: int(countInValid),
	}
	return &metrics, nil
}

func (s *Service) txUserJoinsAgreementsTraining() *gorm.DB {
	return s.db.Model(&types.User{}).
		Joins("INNER JOIN user_agreement_confirmations ON users.id = user_id").
		Joins("INNER JOIN agreements ON user_agreement_confirmations.agreement_id = agreements.id").
		Joins("INNER JOIN user_training_records ON users.id = user_training_records.user_id")
}
