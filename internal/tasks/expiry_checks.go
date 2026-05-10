package tasks

import (
	"context"
	"time"

	"github.com/ucl-arc-tre/portal/internal/config"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
)

const (
	day = 24 * time.Hour
)

func (m *Manager) scheduleDailyChecks() {
	m.mustEvery(day, m.checkContractsExpiry, "checkContractsExpiry")
	m.mustEvery(day, m.checkTrainingCertificatesExpiry, "checkTrainingCertificatesExpiry")
	m.mustEvery(day, m.checkStudySignoffExpiry, "checkStudySignoffExpiry")
}

func (m *Manager) checkContractsExpiry() error {
	if !config.NotificationsEnabled() {
		return nil
	}

	ctx := context.Background()

	studies := []types.Study{}
	result := m.db.Model(&types.Study{}).Preload("Owner").Preload("StudyAdmins.User").Preload("Contracts").Find(&studies)
	if result.Error != nil {
		return types.NewErrFromGorm(result.Error, "failed to get studies")
	}

	for _, study := range studies {

		recipients := []string{string(study.Owner.Username)}
		for _, studyAdmin := range study.StudyAdmins {
			recipients = append(recipients, string(studyAdmin.User.Username))
		}

		contract := study.EarliestExpringContractShouldNotifyExpiry()
		if contract == nil {
			continue
		}
		err := m.entra.SendContractExpiryNotification(ctx, recipients, *contract, study)
		if err != nil {
			return err
		}

	}

	return nil
}

func (m *Manager) checkTrainingCertificatesExpiry() error {
	if !config.NotificationsEnabled() {
		return nil
	}

	ctx := context.Background()

	trainingRecords := []types.UserTrainingRecord{}
	result := m.db.Model(&types.UserTrainingRecord{}).Preload("User").Find(&trainingRecords)
	if result.Error != nil {
		return types.NewErrFromGorm(result.Error, "failed to get training records")
	}

	for _, trainingRecord := range trainingRecords {
		recipient := string(trainingRecord.User.Username)

		if !config.ShouldNotifyTrainingExpiry(trainingRecord) {
			continue
		}

		err := m.entra.SendTrainingExpiryNotification(ctx, recipient, trainingRecord)
		if err != nil {
			return err
		}

	}

	return nil
}

func (m *Manager) checkStudySignoffExpiry() error {
	if !config.NotificationsEnabled() {
		return nil
	}

	ctx := context.Background()

	studies := []types.Study{}
	result := m.db.Model(&types.Study{}).Where("approval_status = ?", openapi.Approved).Preload("Owner").Find(&studies)
	if result.Error != nil {
		return types.NewErrFromGorm(result.Error, "failed to get studies")
	}

	for _, study := range studies {
		if !config.ShouldNotifyStudySignoffExpiry(&study) {
			continue
		}

		err := m.entra.SendStudySignoffExpiryNotification(ctx, string(study.Owner.Username), study)
		if err != nil {
			return err
		}
	}
	return nil
}
