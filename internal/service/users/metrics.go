package users

import (
	"fmt"

	"github.com/ucl-arc-tre/portal/internal/config"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/service/agreements"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

func (s *Service) Metrics() (*openapi.UserMetrics, error) {
	var countTotal int64
	result := s.db.Model(&types.User{}).Count(&countTotal)
	if result.Error != nil {
		return nil, types.NewErrFromGorm(result.Error, "failed to count users")
	}

	var countValid int64
	validCondition := fmt.Sprintf("user_training_records.completed_at > now() - interval '%d year'", config.TrainingValidityYears)
	result = s.txUserJoinsAgreementsTraining().
		Where("agreements.type = ? AND user_training_records.kind = ? AND "+validCondition, agreements.ApprovedResearcherType, types.TrainingKindNHSD).
		Count(&countValid)
	if result.Error != nil {
		return nil, types.NewErrFromGorm(result.Error, "failed to count valid AR users")
	}

	var countInValid int64
	invalidCondition := fmt.Sprintf("user_training_records.completed_at < now() - interval '%d year'", config.TrainingValidityYears)
	result = s.txUserJoinsAgreementsTraining().
		Where("agreements.type = ? AND user_training_records.kind = ? AND "+invalidCondition, agreements.ApprovedResearcherType, types.TrainingKindNHSD).
		Count(&countInValid)
	if result.Error != nil {
		return nil, types.NewErrFromGorm(result.Error, "failed to count invalid AR users")
	}

	metrics := openapi.UserMetrics{
		Total:                                int(countTotal),
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
