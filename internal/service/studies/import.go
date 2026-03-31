package studies

import (
	"time"

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
		Assign(&study). // update all fields
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

	ownerSignature := types.StudyAgreementSignature{
		UserID:      owner.ID,
		StudyID:     study.ID,
		AgreementID: agreemeent.ID,
	}
	if err := tx.Where(&ownerSignature).FirstOrCreate(&ownerSignature).Error; err != nil {
		tx.Rollback()
		return nil, types.NewErrFromGorm(err, "failed to agree owner agreement")
	}

	if data.AdditionalStudyAdminUsername != nil {
		admin, err := s.users.PersistedUser(types.Username(*data.AdditionalStudyAdminUsername))
		if err != nil {
			tx.Rollback()
			return nil, err
		}

		studyAdmin := types.StudyAdmin{StudyID: study.ID, UserID: admin.ID}
		if err := tx.Model(&studyAdmin).Where("user_id = ? AND study_id = ?", admin.ID, study.ID).Assign(&studyAdmin).FirstOrCreate(&studyAdmin).Error; err != nil {
			tx.Rollback()
			return nil, types.NewErrFromGorm(err, "failed to create study admin")
		}

		adminRole := rbac.StudyRole{StudyID: study.ID, Name: rbac.StudyOwner}
		if _, err := rbac.AddRole(owner, adminRole.RoleName()); err != nil {
			tx.Rollback()
			return nil, err
		}

		adminSignature := types.StudyAgreementSignature{
			UserID:      admin.ID,
			StudyID:     study.ID,
			AgreementID: agreemeent.ID,
		}
		if err := tx.Where(&adminSignature).FirstOrCreate(&adminSignature).Error; err != nil {
			tx.Rollback()
			return nil, types.NewErrFromGorm(err, "failed to agree admin agreement")
		}

		studyAdmin.User = admin
		study.StudyAdmins = append(study.StudyAdmins, studyAdmin)
	}

	log.Debug().Any("id", study.ID).Msg("Imported study")
	return &study, commitTransaction(tx)
}
