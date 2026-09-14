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
		Object:    study.EventObject(),
		Body:      body,
	}
	return createOrError(tx, &event, "failed to record study feedback audit event")
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
	return createOrError(tx, &event, "failed to record study feedback audit event")
}

func LogStudyCreation(tx *gorm.DB, creator types.User, study types.Study) error {
	event := types.AuditEvent{
		UserID:    creator.ID,
		Operation: types.AuditOperationCreate,
		Object:    study.EventObject(),
		Body:      fmt.Sprintf("Study '%s' created.", study.Title),
	}
	return createOrError(tx, &event, "failed to record study creation audit event")
}

func LogStudyAdministratorAssignment(tx *gorm.DB, updater types.User, administrator types.User, study types.Study) error {
	event := types.AuditEvent{
		UserID:    updater.ID,
		Operation: types.AuditOperationUpdate,
		Object:    study.EventObject(),
		Body:      fmt.Sprintf("User '%s' (%s) assigned as an administrator of study '%s'.", administrator.Username, administrator.ID, study.Title),
	}
	return createOrError(tx, &event, "failed to record study administrator assignment audit event")
}

func LogStudyAdministratorRemoval(tx *gorm.DB, updater types.User, administrator types.User, study types.Study) error {
	event := types.AuditEvent{
		UserID:    updater.ID,
		Operation: types.AuditOperationUpdate,
		Object:    study.EventObject(),
		Body:      fmt.Sprintf("User '%s' (%s) removed as an administrator of study '%s'.", administrator.Username, administrator.ID, study.Title),
	}
	return createOrError(tx, &event, "failed to record study administrator removal audit event")
}

func LogStudyOwnerChangeRequest(tx *gorm.DB, requester types.User, study types.Study, fromOwner types.User, toOwner types.User) error {
	event := types.AuditEvent{
		UserID:    requester.ID,
		Operation: types.AuditOperationUpdate,
		Object:    study.EventObject(),
		Body:      fmt.Sprintf("Study owner change requested from '%s' (%s) to '%s' (%s).", fromOwner.Username, fromOwner.ID, toOwner.Username, toOwner.ID),
	}
	return createOrError(tx, &event, "failed to record study owner change request audit event")
}

func LogStudyOwnerChangeApproval(tx *gorm.DB, approver types.User, study types.Study, fromOwner types.User, toOwner types.User) error {
	event := types.AuditEvent{
		UserID:    approver.ID,
		Operation: types.AuditOperationUpdate,
		Object:    study.EventObject(),
		Body:      fmt.Sprintf("Study owner change approved from '%s' (%s) to '%s' (%s).", fromOwner.Username, fromOwner.ID, toOwner.Username, toOwner.ID),
	}
	return createOrError(tx, &event, "failed to record study owner change approval audit event")
}

func LogStudySignoff(tx *gorm.DB, signer types.User, study types.Study) error {
	event := types.AuditEvent{
		UserID:    signer.ID,
		Operation: types.AuditOperationUpdate,
		Object:    study.EventObject(),
		Body:      fmt.Sprintf("Study '%s' signed off.", study.Title),
	}
	return createOrError(tx, &event, "failed to record study signoff audit event")
}

func LogProjectCreation(tx *gorm.DB, creator types.User, project types.Project) error {
	event := types.AuditEvent{
		UserID:    creator.ID,
		Operation: types.AuditOperationCreate,
		Object:    project.EventObject(),
		Body:      fmt.Sprintf("Project '%s' created.", project.Name),
	}
	return createOrError(tx, &event, "failed to record project creation audit event")
}
