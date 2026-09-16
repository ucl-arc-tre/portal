package tasks

import (
	"context"
	"errors"

	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

const (
	batchSize = 100
)

func (m *Manager) checkAssetsExpiry() error {
	if !config.NotificationsEnabled() {
		return nil
	}

	studies := []types.Study{}
	errs := []error{}
	result := m.db.Model(&types.Study{}).
		Preload("Owner").
		Preload("StudyAdmins.User").
		Preload("Assets").
		FindInBatches(&studies, batchSize, func(_ *gorm.DB, batch int) error {
			for _, study := range studies {
				if err := m.checkAssetExpiry(study); err != nil {
					errs = append(errs, err)
				}
			}
			return nil
		})

	if result.Error != nil {
		return types.NewErrFromGorm(result.Error, "failed to get studies")
	}

	return errors.Join(errs...)
}

func (m *Manager) checkAssetExpiry(study types.Study) error {
	assetsShouldNotify := []types.Asset{}
	for _, asset := range study.Assets {
		if config.ShouldNotifyAssetExpiry(asset) {
			assetsShouldNotify = append(assetsShouldNotify, asset)
		}
	}
	if len(assetsShouldNotify) == 0 {
		return nil
	}

	log.Debug().Str("study", study.Title).Msg("Notifying assets expiry")
	return m.notifications.NotifyAssetExpiry(context.Background(), assetsShouldNotify, study)
}

func (m *Manager) checkContractsExpiry() error {
	if !config.NotificationsEnabled() {
		return nil
	}

	studies := []types.Study{}
	errs := []error{}

	result := m.db.Model(&types.Study{}).
		Preload("Owner").
		Preload("StudyAdmins.User").
		Preload("Contracts").
		FindInBatches(&studies, batchSize, func(_ *gorm.DB, batch int) error {
			for _, study := range studies {
				if err := m.checkContractExpiry(study); err != nil {
					errs = append(errs, err)
				}
			}
			return nil
		})
	if result.Error != nil {
		return types.NewErrFromGorm(result.Error, "failed to get studies")
	}
	return errors.Join(errs...)
}

func (m *Manager) checkContractExpiry(study types.Study) error {
	contract := earliestExpiringContractShouldNotifyExpiry(study)
	if contract == nil {
		return nil
	}

	log.Debug().Str("study", study.Title).Str("contract", contract.Title).Msg("Notifying contract expiry")
	return m.notifications.NotifyContractExpiry(context.Background(), *contract, study)
}

// Return the contract with the most urgent expiry notification.
// Returns nil if there are no contracts that should notify the expiry for
func earliestExpiringContractShouldNotifyExpiry(study types.Study) *types.Contract {
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

	trainingRecords := []types.UserTrainingRecord{}
	errs := []error{}
	result := m.db.Model(&types.UserTrainingRecord{}).
		Preload("User").
		FindInBatches(&trainingRecords, batchSize, func(_ *gorm.DB, _ int) error {
			for _, trainingRecord := range trainingRecords {
				if err := m.checkTrainingCertificateExpiry(trainingRecord); err != nil {
					errs = append(errs, err)
				}
			}
			return nil
		})

	if result.Error != nil {
		return types.NewErrFromGorm(result.Error, "failed to get training records")
	}
	return errors.Join(errs...)
}

func (m *Manager) checkTrainingCertificateExpiry(trainingRecord types.UserTrainingRecord) error {
	if !config.ShouldNotifyTrainingExpiry(trainingRecord) {
		return nil
	}
	return m.notifications.NotifyTrainingExpiry(context.Background(), trainingRecord)
}

func (m *Manager) checkStudiesSignoffExpiry() error {
	if !config.NotificationsEnabled() {
		return nil
	}

	studies := []types.Study{}
	errs := []error{}
	result := m.db.Model(&types.Study{}).
		Where("approval_status = ?", openapi.StudyApprovalStatusApproved).
		Preload("Owner").
		FindInBatches(&studies, batchSize, func(_ *gorm.DB, _ int) error {
			for _, study := range studies {
				if err := m.checkStudySignoffExpiry(study); err != nil {
					errs = append(errs, err)
				}
			}
			return nil
		})

	if result.Error != nil {
		return types.NewErrFromGorm(result.Error, "failed to get studies")
	}

	return errors.Join(errs...)
}

func (m *Manager) checkStudySignoffExpiry(study types.Study) error {
	if !config.ShouldNotifyStudySignoffExpiry(&study) {
		return nil
	}

	log.Debug().Str("study", study.Title).Any("owner", study.Owner.Username).Msg("Notifying study signoff")
	return m.notifications.NotifyStudySignoffExpiry(context.Background(), study)
}

func (m *Manager) checkProjectsAccessReviewExpiry() error {
	if !config.NotificationsEnabled() {
		return nil
	}

	projects := []types.Project{}
	errs := []error{}
	check := func(_ *gorm.DB, _ int) error {
		for _, project := range projects {
			if err := m.checkProjectAccessReviewExpiry(project); err != nil {
				errs = append(errs, err)
			}
		}
		return nil
	}

	result := m.db.
		Joins("JOIN project_tres ON project_tres.project_id = projects.id AND project_tres.status = ?", types.ProjectTREStatusDeployed).
		Preload("Study.Owner").Preload("Study.StudyAdmins.User").Preload("Environment").
		FindInBatches(&projects, batchSize, check)
	if result.Error != nil {
		return types.NewErrFromGorm(result.Error, "failed to get TRE projects")
	}

	result = m.db.
		Joins("JOIN project_dshes ON project_dshes.project_id = projects.id AND project_dshes.status = ?", types.ProjectDSHStatusActive).
		Preload("Study.Owner").Preload("Study.StudyAdmins.User").Preload("Environment").
		FindInBatches(&projects, batchSize, check)
	if result.Error != nil {
		return types.NewErrFromGorm(result.Error, "failed to get DSH projects")
	}
	return errors.Join(errs...)
}

func (m *Manager) checkProjectAccessReviewExpiry(project types.Project) error {
	if !config.ShouldNotifyProjectAccessReviewExpiry(&project) {
		return nil
	}

	log.Debug().Str("project", project.Name).Msg("Notifying project access review")
	return m.notifications.NotifyProjectAccessReviewExpiry(context.Background(), project)
}
