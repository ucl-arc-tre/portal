package tasks

import (
	"context"
	"fmt"
	"time"

	"github.com/ucl-arc-tre/portal/internal/types"
)

func (m *Manager) checkContractsExpiryDaily() error {
	// RM: every day, check time left on contract expiry, send notification at 30 days, 14 days, 7 days and 1 day

	ctx := context.Background()

	contracts := []types.Contract{}
	result := m.db.Model(&types.Contract{}).Find(&contracts)
	if result.Error != nil {
		return types.NewErrFromGorm(result.Error, "failed to get contracts")
	}

	for _, contract := range contracts {
		daysUntilExpiry := int(time.Until(contract.ExpiryDate).Hours() / 24)

		if daysUntilExpiry == 30 || daysUntilExpiry == 14 || daysUntilExpiry == 7 || daysUntilExpiry == 1 {
			// send notification to IAO + IAA

			recipients := []string{string(contract.Study.Owner.Username)}
			for _, studyAdmin := range contract.Study.StudyAdmins {
				recipients = append(recipients, string(studyAdmin.User.Username))
			}

			if err := m.entra.SendExpiryNotification(ctx, recipients, fmt.Sprint(rune(daysUntilExpiry)), contract); err != nil {
				return err
			}
		}
	}
	return nil
}

func (m *Manager) DailyChecks() {
	m.mustEvery(time.Hour*24, m.checkContractsExpiryDaily, "checkContractsExpiryDaily")
}
