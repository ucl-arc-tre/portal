package tasks

import (
	"context"
	"time"

	"github.com/ucl-arc-tre/portal/internal/types"
)

func (m *Manager) checkContractsExpiry() error {
	ctx := context.Background()

	studies := []types.Study{}
	result := m.db.Model(&types.Study{}).Preload("Contracts").Find(&studies)
	if result.Error != nil {
		return types.NewErrFromGorm(result.Error, "failed to get studies")
	}

	for _, study := range studies {

		recipients := []string{string(study.Owner.Username)}
		for _, studyAdmin := range study.StudyAdmins {
			recipients = append(recipients, string(studyAdmin.User.Username))
		}

		for _, contract := range study.Contracts {
			daysUntilExpiry := int(time.Until(contract.ExpiryDate).Hours() / 24)

			if daysUntilExpiry < 0 {
				err := m.entra.SendExpiryNotification(ctx, recipients, daysUntilExpiry, contract)
				if err != nil {
					return err
				}
				return nil
			} else if daysUntilExpiry == 1 {
				err := m.entra.SendExpiryNotification(ctx, recipients, daysUntilExpiry, contract)
				if err != nil {
					return err
				}
				return nil
			} else if daysUntilExpiry == 30 || daysUntilExpiry == 14 || daysUntilExpiry == 7 {

				err := m.entra.SendExpiryNotification(ctx, recipients, daysUntilExpiry, contract)
				if err != nil {
					return err
				}
				return nil
			}
		}
	}

	return nil
}

func (m *Manager) DailyChecks() {
	m.mustEvery(time.Minute*1440, m.checkContractsExpiry, "checkContractsExpiry")
}
