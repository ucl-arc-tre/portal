package studies

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/graceful"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/service/agreements"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func (s *Service) ImportStudy(data openapi.StudyImport) (*types.Study, error) {
	// NOTE: this deliberately doesn't do strong validation of the object

	tx := s.db.Begin()
	defer graceful.RollbackTransactionOnPanic(tx)

	study := types.Study{
		Caseref:                          data.Caseref,
		Title:                            data.Title,
		Description:                      data.Description,
		DataControllerOrganisation:       data.DataControllerOrganisation,
		InvolvesUclSponsorship:           data.InvolvesUclSponsorship,
		InvolvesCag:                      data.InvolvesCag,
		CagReference:                     data.CagReference,
		InvolvesEthicsApproval:           data.InvolvesEthicsApproval,
		InvolvesHraApproval:              data.InvolvesHraApproval,
		IrasId:                           data.IrasId,
		IsNhsAssociated:                  data.IsNhsAssociated,
		InvolvesNhsEngland:               data.InvolvesNhsEngland,
		NhsEnglandReference:              data.NhsEnglandReference,
		InvolvesMnca:                     data.InvolvesMnca,
		RequiresDspt:                     data.RequiresDspt,
		RequiresDbs:                      data.RequiresDbs,
		IsDataProtectionOfficeRegistered: data.IsDataProtectionOfficeRegistered,
		InvolvesThirdParty:               data.InvolvesThirdParty,
		InvolvesExternalUsers:            data.InvolvesExternalUsers,
		InvolvesParticipantConsent:       data.InvolvesParticipantConsent,
		InvolvesIndirectDataCollection:   data.InvolvesDataProcessingOutsideEea,
		Feedback:                         data.Feedback,
	}
	if !openapi.ApprovalStatus(data.ApprovalStatus).Valid() {
		return nil, types.NewErrInvalidObject("invalid approval status")
	} else {
		study.ApprovalStatus = data.ApprovalStatus
	}

	if data.LastSignoff != nil {
		if lastSignoff, err := time.Parse(config.TimeFormat, *data.LastSignoff); err != nil {
			return nil, types.NewErrInvalidObject(err)
		} else {
			study.LastSignoff = &lastSignoff
		}
	}

	if createdAt, err := time.Parse(config.TimeFormat, data.CreatedAt); err != nil {
		return nil, types.NewErrInvalidObject(err)
	} else {
		study.CreatedAt = createdAt
	}

	if updatedAt, err := time.Parse(config.TimeFormat, data.UpdatedAt); err != nil {
		return nil, types.NewErrInvalidObject(err)
	} else {
		study.UpdatedAt = updatedAt
	}

	owner, err := s.users.PersistedUser(types.Username(data.OwnerUsername))
	if err != nil {
		return nil, err
	} else {
		study.OwnerUserID = owner.ID
		study.Owner = owner
	}

	result := tx.Model(&types.Study{}).
		Assign(study). // update all fields
		Where("caseref = ?", data.Caseref).
		FirstOrCreate(&study)
	if result.Error != nil {
		tx.Rollback()
		return nil, types.NewErrFromGorm(err, "failed to create study")
	}

	if _, err := rbac.AddStudyOwnerRole(owner, study.ID); err != nil {
		tx.Rollback()
		return nil, err
	}

	agreemeent := types.Agreement{}
	if err := s.db.Where("type = ?", agreements.StudyOwnerType).Order("created_at desc").Limit(1).First(&agreemeent).Error; err != nil {
		tx.Rollback()
		return nil, types.NewErrFromGorm(err, "failed to get agreement")
	}

	if data.OwnerAgreedAt != nil {
		agreedAt, err := time.Parse(config.TimeFormat, *data.OwnerAgreedAt)
		if err != nil {
			return nil, types.NewErrInvalidObject(err)
		}
		ownerSignature := types.StudyAgreementSignature{
			Model:       types.Model{CreatedAt: agreedAt},
			UserID:      owner.ID,
			StudyID:     study.ID,
			AgreementID: agreemeent.ID,
		}
		if err := tx.Where(&ownerSignature).FirstOrCreate(&ownerSignature).Error; err != nil {
			tx.Rollback()
			return nil, types.NewErrFromGorm(err, "failed to agree owner agreement")
		}
	}

	if data.AdditionalStudyAdminUsername != nil {
		admin, err := s.users.PersistedUser(types.Username(*data.AdditionalStudyAdminUsername))
		if err != nil {
			tx.Rollback()
			return nil, err
		}

		studyAdmin := types.StudyAdmin{StudyID: study.ID, UserID: admin.ID}
		if err := tx.Model(&studyAdmin).Where("user_id = ? AND study_id = ?", admin.ID, study.ID).Assign(studyAdmin).FirstOrCreate(&studyAdmin).Error; err != nil {
			tx.Rollback()
			return nil, types.NewErrFromGorm(err, "failed to create study admin")
		}

		adminRole := rbac.StudyRole{StudyID: study.ID, Name: rbac.StudyOwner}
		if _, err := rbac.AddRole(owner, adminRole.RoleName()); err != nil {
			tx.Rollback()
			return nil, err
		}

		if data.AdminAgreedAt != nil {
			agreedAt, err := time.Parse(config.TimeFormat, *data.AdminAgreedAt)
			if err != nil {
				return nil, types.NewErrInvalidObject(err)
			}
			adminSignature := types.StudyAgreementSignature{
				Model:       types.Model{CreatedAt: agreedAt},
				UserID:      admin.ID,
				StudyID:     study.ID,
				AgreementID: agreemeent.ID,
			}
			if err := tx.Where(&adminSignature).FirstOrCreate(&adminSignature).Error; err != nil {
				tx.Rollback()
				return nil, types.NewErrFromGorm(err, "failed to agree admin agreement")
			}
		}

		studyAdmin.User = admin
		study.StudyAdmins = append(study.StudyAdmins, studyAdmin)
	}

	log.Debug().Any("id", study.ID).Msg("Imported study")
	return &study, commitTransaction(tx)
}

func (s *Service) ImportAsset(studyId uuid.UUID, data openapi.AssetImport) (*types.Asset, error) {
	// NOTE: this deliberately doesn't do strong validation of the object

	tx := s.db.Begin()
	defer graceful.RollbackTransactionOnPanic(tx)

	study := types.Study{}
	if err := tx.Where("id = ?", studyId).First(&study).Error; err != nil {
		tx.Rollback()
		return nil, types.NewErrFromGorm(err, "failed to get study")
	}

	asset := types.Asset{
		Title:              data.Title,
		Description:        data.Description,
		Tier:               data.Tier,
		CreatorUserID:      study.OwnerUserID,
		StudyID:            studyId,
		Protection:         data.Protection,
		LegalBasis:         data.LegalBasis,
		Format:             data.Format,
		RequiresContract:   data.RequiresContract,
		HasDspt:            data.HasDspt,
		StoredOutsideUkEea: data.StoredOutsideUkEea,
		Status:             data.Status,
	}
	switch data.Tier {
	case 0:
		asset.ClassificationImpact = string(openapi.AssetClassificationImpactPublic)
	case 1:
		asset.ClassificationImpact = string(openapi.AssetBaseClassificationImpactConfidential)
	case 2, 3, 4:
		asset.ClassificationImpact = string(openapi.AssetClassificationImpactHighlyConfidential)
	default:
		return nil, types.NewErrInvalidObject("invalid tier impact")
	}

	if createdAt, err := time.Parse(config.TimeFormat, data.CreatedAt); err != nil {
		return nil, types.NewErrInvalidObject("failed to parse created at")
	} else {
		asset.CreatedAt = createdAt
	}
	if expiresAt, err := time.Parse(config.TimeFormat, data.ExpiresAt); err != nil {
		return nil, types.NewErrInvalidObject("failed to parse expires at")
	} else {
		asset.ExpiresAt = expiresAt
	}

	if err := tx.Where("title = ? AND study_id = ?", asset.Title, studyId).Assign(asset).FirstOrCreate(&asset).Error; err != nil {
		tx.Rollback()
		return nil, types.NewErrFromGorm(err, "failed to create asset")
	}

	for _, locationStr := range data.Locations {
		if locationStr == "" {
			return nil, types.NewErrInvalidObject("empty location string")
		}
		assetLocation := types.AssetLocation{
			AssetID:  asset.ID,
			Location: locationStr,
		}
		if err := tx.Where("asset_id = ? AND location = ?", asset.ID, locationStr).FirstOrCreate(&assetLocation).Error; err != nil {
			tx.Rollback()
			return nil, types.NewErrFromGorm(err, "failed to create asset location")
		}
		asset.Locations = append(asset.Locations, assetLocation)
	}

	return &asset, commitTransaction(tx)
}

func (s *Service) ImportContract(studyId uuid.UUID, data openapi.ContractImport) (*types.Contract, error) {
	// NOTE: this deliberately doesn't do strong validation of the object

	tx := s.db.Begin()
	defer graceful.RollbackTransactionOnPanic(tx)

	study := types.Study{}
	if err := tx.Where("id = ?", studyId).First(&study).Error; err != nil {
		tx.Rollback()
		return nil, types.NewErrFromGorm(err, "failed to get study")
	}

	contract := types.Contract{
		StudyID:        studyId,
		CreatorUserID:  study.OwnerUserID,
		Title:          data.Title,
		ThirdPartyName: data.ThirdPartyName,
		Status:         data.Status,
	}

	if data.OrganisationSignatory != nil {
		signatory, err := s.persistedContractSignatory(context.Background(), *data.OrganisationSignatory)
		if err != nil {
			return nil, err
		}
		contract.SignatoryUserId = &signatory.ID
		contract.SignatoryUser = signatory
	}

	if data.StartAt != nil {
		if startDate, err := time.Parse(config.TimeFormat, *data.StartAt); err != nil {
			return nil, types.NewErrInvalidObject("invalid date")
		} else {
			contract.StartDate = &startDate
		}
	}
	if data.ExpiryAt != nil {
		if expiryDate, err := time.Parse(config.TimeFormat, *data.ExpiryAt); err != nil {
			return nil, types.NewErrInvalidObject("invalid date")
		} else {
			contract.ExpiryDate = &expiryDate
		}
	}

	if err := tx.Where("title = ? AND study_id = ?", contract.Title, studyId).Assign(contract).FirstOrCreate(&contract).Error; err != nil {
		tx.Rollback()
		return nil, types.NewErrFromGorm(err, "failed to create contract")
	}

	contract.Study = study
	return &contract, commitTransaction(tx)
}
