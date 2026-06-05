package tasks

import (
	"context"
	"time"

	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
)

const (
	day = 24 * time.Hour
)

func (m *Manager) scheduleDailyChecks() {
	m.mustEvery(day, m.checkAssetsExpiry, "checkAssetsExpiry")
	m.mustEvery(day, m.checkContractsExpiry, "checkContractsExpiry")
	m.mustEvery(day, m.checkTrainingCertificatesExpiry, "checkTrainingCertificatesExpiry")
	m.mustEvery(day, m.checkStudySignoffExpiry, "checkStudySignoffExpiry")
}

func (m *Manager) checkAssetsExpiry() error {
	if !config.NotificationsEnabled() {
		return nil
	}

	studies := []types.Study{}
	result := m.db.Model(&types.Study{}).Preload("Owner").Preload("StudyAdmins.User").Preload("Assets").Find(&studies)
	if result.Error != nil {
		return types.NewErrFromGorm(result.Error, "failed to get studies")
	}

	ctx := context.Background()

	for _, study := range studies {
		assetsShouldNotify := []types.Asset{}
		for _, asset := range study.Assets {
			if config.ShouldNotifyAssetExpiry(asset) {
				assetsShouldNotify = append(assetsShouldNotify, asset)
			}
		}
		if len(assetsShouldNotify) == 0 {
			continue
		}

		log.Debug().Str("study", study.Title).Msg("Notifying assets expiry")
		err := m.entra.SendAssetExpiryNotification(ctx, assetsShouldNotify, study)
		if err != nil {
			return err
		}
	}
	return nil
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

		contract := earliestExpringContractShouldNotifyExpiry(study)
		if contract == nil {
			continue
		}

		log.Debug().Str("study", study.Title).Str("contract", contract.Title).Msg("Notifying contract expiry")
		err := m.entra.SendContractExpiryNotification(ctx, *contract, study)
		if err != nil {
			return err
		}
	}

	return nil
}

// Return the contract with the most urgent expiry notification.
// Returns nil if there are no contracts that should notify the expiry for
func earliestExpringContractShouldNotifyExpiry(study types.Study) *types.Contract {
	var expiringContract *types.Contract
	for _, contract := range study.Contracts {
		if !config.ShouldNotifyContractExpiry(contract) {
			continue
		}
		if expiringContract == nil {
			expiringContract = &contract
			continue
		}
		daysUntilExpiry := config.DaysUntilContractExpiry(contract)
		if daysUntilExpiry != nil && *daysUntilExpiry < *config.DaysUntilContractExpiry(*expiringContract) {
			expiringContract = &contract
		}
	}
	return expiringContract
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
		if !config.ShouldNotifyTrainingExpiry(trainingRecord) {
			continue
		}

		recipient := string(trainingRecord.User.Username)
		log.Debug().Any("username", recipient).Msg("Notifying training expiry")
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
	result := m.db.Model(&types.Study{}).Where("approval_status = ?", openapi.StudyApprovalStatusApproved).Preload("Owner").Find(&studies)
	if result.Error != nil {
		return types.NewErrFromGorm(result.Error, "failed to get studies")
	}

	for _, study := range studies {
		if !config.ShouldNotifyStudySignoffExpiry(&study) {
			continue
		}

		log.Debug().Str("study", study.Title).Any("owner", study.Owner.Username).Msg("Notifying study signoff")
		err := m.entra.SendStudySignoffExpiryNotification(ctx, string(study.Owner.Username), study)
		if err != nil {
			return err
		}
	}
	return nil
}
