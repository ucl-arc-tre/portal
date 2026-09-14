package audit

import (
	"fmt"

	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

func LogStudyFeedback(tx *gorm.DB, reviewer types.User, feedback types.StudyFeedback) error {
	var study types.Study
	if err := tx.First(&study, "id = ?", feedback.StudyID).Error; err != nil {
		return types.NewErrFromGorm(err, "failed to get study for feedback audit event")
	}

	body := fmt.Sprintf("Study review status changed to '%s'.", feedback.Status)
	if feedback.Feedback != nil && *feedback.Feedback != "" {
		body += "\nFeedback: " + *feedback.Feedback
	}

	event := types.AuditEvent{
		UserID:    reviewer.ID,
		Operation: types.AuditOperationUpdate,
		Object: types.AuditEventObject{
			ID:   study.ID,
			Name: &study.Title,
			Type: types.AuditEventObjectTypeStudy,
		},
		Body: body,
	}
	return types.NewErrFromGorm(tx.Create(&event).Error, "failed to record study feedback audit event")
}

func LogTrainingUpdate(tx *gorm.DB, updater types.User, record types.UserTrainingRecord) error {
	event := types.AuditEvent{
		UserID:    updater.ID,
		Operation: types.AuditOperationUpdate,
		Object: types.AuditEventObject{
			ID:   record.ID,
			Type: types.AuditEventObjectTypeTrainingRecord,
		},
		Body: fmt.Sprintf("Training '%s' updated to completed at '%s'", record.Kind, marshalTime(record.CompletedAt)),
	}
	return types.NewErrFromGorm(tx.Create(&event).Error, "failed to record study feedback audit event")
}

func LogStudyCreation(tx *gorm.DB, creator types.User, study types.Study) error {
	event := types.AuditEvent{
		UserID:    creator.ID,
		Operation: types.AuditOperationCreate,
		Object: types.AuditEventObject{
			ID:   study.ID,
			Name: &study.Title,
			Type: types.AuditEventObjectTypeStudy,
		},
		Body: fmt.Sprintf("Study '%s' created.", study.Title),
	}
	return types.NewErrFromGorm(tx.Create(&event).Error, "failed to record study creation audit event")
}

// func LogStudyUpdate() {
//
// }
//
// func LogStudySignoff() {
//
// }
