package tasks

import (
	"context"
	"time"

	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/types"
)

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

		contract := study.EarliestExpringContractWithin30Days()
		if contract == nil {
			continue
		}
		err := m.entra.SendExpiryNotification(ctx, recipients, *contract, study)
		if err != nil {
			return err
		}

	}

	return nil
}

func (m *Manager) scheduleDailyChecks() {
	m.mustEvery(time.Minute*1440, m.checkContractsExpiry, "checkContractsExpiry")
}
