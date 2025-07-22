package web

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

func (h *Handler) GetStudies(ctx *gin.Context) {
	user := middleware.GetUser(ctx)

	studies, err := h.studies.GetStudies(user.ID)
	if err != nil {
		setError(ctx, err, "Failed to retrieve studies")
		return
	}

	// Convert database studies to OpenAPI format
	var response []openapi.Study
	for _, study := range studies {
		ownerUserIDStr := study.OwnerUserID.String()

		// Extract admin usernames from StudyAdmins
		var adminUsernames []string
		for _, studyAdmin := range study.StudyAdmins {
			adminUsernames = append(adminUsernames, string(studyAdmin.User.Username))
		}
		var adminUsernamesPtr *[]string
		if len(adminUsernames) > 0 {
			adminUsernamesPtr = &adminUsernames
		}

		response = append(response, openapi.Study{
			Id:                               study.ID.String(),
			Title:                            study.Title,
			Description:                      study.Description,
			OwnerUserId:                      &ownerUserIDStr,
			AdditionalStudyAdminUsernames:    adminUsernamesPtr,
			DataControllerOrganisation:       study.DataControllerOrganisation,
			InvolvesUclSponsorship:           study.InvolvesUclSponsorship,
			InvolvesCag:                      study.InvolvesCag,
			CagReference:                     study.CagReference,
			InvolvesEthicsApproval:           study.InvolvesEthicsApproval,
			InvolvesHraApproval:              study.InvolvesHraApproval,
			IrasId:                           study.IrasId,
			IsNhsAssociated:                  study.IsNhsAssociated,
			InvolvesNhsEngland:               study.InvolvesNhsEngland,
			NhsEnglandReference:              study.NhsEnglandReference,
			InvolvesMnca:                     study.InvolvesMnca,
			RequiresDspt:                     study.RequiresDspt,
			RequiresDbs:                      study.RequiresDbs,
			IsDataProtectionOfficeRegistered: study.IsDataProtectionOfficeRegistered,
			DataProtectionPrefix:             study.DataProtectionPrefix,
			DataProtectionDate:               study.DataProtectionDate,
			DataProtectionId:                 study.DataProtectionId,
			DataProtectionNumber:             study.DataProtectionNumber,
			InvolvesThirdParty:               study.InvolvesThirdParty,
			InvolvesExternalUsers:            study.InvolvesExternalUsers,
			InvolvesParticipantConsent:       study.InvolvesParticipantConsent,
			InvolvesIndirectDataCollection:   study.InvolvesIndirectDataCollection,
			InvolvesDataProcessingOutsideEea: study.InvolvesDataProcessingOutsideEea,
			CreatedAt:                        study.CreatedAt.Format(config.TimeFormat),
			UpdatedAt:                        study.UpdatedAt.Format(config.TimeFormat),
		})
	}

	ctx.JSON(http.StatusOK, response)
}

func (h *Handler) PostStudies(ctx *gin.Context) {
	user := middleware.GetUser(ctx)

	var studyData openapi.StudyCreateRequest
	if err := ctx.ShouldBindJSON(&studyData); err != nil {
		setError(ctx, types.NewErrInvalidObject(err), "Invalid request body")
		return
	}

	createdStudy, err := h.studies.CreateStudy(ctx.Request.Context(), user.ID, studyData)
	if err != nil {
		setError(ctx, types.NewErrServerError(err), "Failed to create study")
		return
	}

	ownerUserIDStr := createdStudy.OwnerUserID.String()

	// Extract admin usernames from StudyAdmins
	var adminUsernames []string
	for _, studyAdmin := range createdStudy.StudyAdmins {
		adminUsernames = append(adminUsernames, string(studyAdmin.User.Username))
	}
	var adminUsernamesPtr *[]string
	if len(adminUsernames) > 0 {
		adminUsernamesPtr = &adminUsernames
	}

	response := openapi.Study{
		Id:                               createdStudy.ID.String(),
		Title:                            createdStudy.Title,
		Description:                      createdStudy.Description,
		OwnerUserId:                      &ownerUserIDStr,
		AdditionalStudyAdminUsernames:    adminUsernamesPtr,
		DataControllerOrganisation:       createdStudy.DataControllerOrganisation,
		InvolvesUclSponsorship:           createdStudy.InvolvesUclSponsorship,
		InvolvesCag:                      createdStudy.InvolvesCag,
		CagReference:                     createdStudy.CagReference,
		InvolvesEthicsApproval:           createdStudy.InvolvesEthicsApproval,
		InvolvesHraApproval:              createdStudy.InvolvesHraApproval,
		IrasId:                           createdStudy.IrasId,
		IsNhsAssociated:                  createdStudy.IsNhsAssociated,
		InvolvesNhsEngland:               createdStudy.InvolvesNhsEngland,
		NhsEnglandReference:              createdStudy.NhsEnglandReference,
		InvolvesMnca:                     createdStudy.InvolvesMnca,
		RequiresDspt:                     createdStudy.RequiresDspt,
		RequiresDbs:                      createdStudy.RequiresDbs,
		IsDataProtectionOfficeRegistered: createdStudy.IsDataProtectionOfficeRegistered,
		DataProtectionPrefix:             createdStudy.DataProtectionPrefix,
		DataProtectionDate:               createdStudy.DataProtectionDate,
		DataProtectionId:                 createdStudy.DataProtectionId,
		DataProtectionNumber:             createdStudy.DataProtectionNumber,
		InvolvesThirdParty:               createdStudy.InvolvesThirdParty,
		InvolvesExternalUsers:            createdStudy.InvolvesExternalUsers,
		InvolvesParticipantConsent:       createdStudy.InvolvesParticipantConsent,
		InvolvesIndirectDataCollection:   createdStudy.InvolvesIndirectDataCollection,
		InvolvesDataProcessingOutsideEea: createdStudy.InvolvesDataProcessingOutsideEea,
		CreatedAt:                        createdStudy.CreatedAt.Format(config.TimeFormat),
		UpdatedAt:                        createdStudy.UpdatedAt.Format(config.TimeFormat),
	}

	ctx.JSON(http.StatusCreated, response)
}

func (h *Handler) GetStudiesStudyIdAssets(ctx *gin.Context, studyId string) {
	user := middleware.GetUser(ctx)

	studyUUID, err := uuid.Parse(studyId)
	if err != nil {
		setError(ctx, types.NewErrInvalidObject(err), "Invalid study ID format")
		return
	}

	// todo - use portal not gorm errors
	assets, err := h.studies.GetStudyAssets(studyUUID, user.ID)

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			setError(ctx, types.NewErrInvalidObject(err), "Study not found or you don't have permission to access it")
			return
		}
		setError(ctx, types.NewErrServerError(err), "Failed to retrieve assets")
		return
	}

	// prepare the final response
	var response []openapi.Asset
	for _, asset := range assets {
		var locations []string
		for _, loc := range asset.Locations {
			locations = append(locations, loc.Location)
		}

		response = append(response, openapi.Asset{
			Id:                     asset.ID.String(),
			Title:                  asset.Title,
			Description:            asset.Description,
			ClassificationImpact:   openapi.AssetClassificationImpact(asset.ClassificationImpact),
			Protection:             openapi.AssetProtection(asset.Protection),
			LegalBasis:             asset.LegalBasis,
			Format:                 asset.Format,
			Expiry:                 asset.Expiry,
			Locations:              locations,
			HasDspt:                asset.HasDspt,
			StoredOutsideUkEea:     asset.StoredOutsideUkEea,
			AccessedByThirdParties: asset.AccessedByThirdParties,
			ThirdPartyAgreement:    asset.ThirdPartyAgreement,
			Status:                 openapi.AssetStatus(asset.Status),
			CreatedAt:              asset.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			UpdatedAt:              asset.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		})
	}

	ctx.JSON(http.StatusOK, response)
}

func (h *Handler) PostStudiesStudyIdAssets(ctx *gin.Context, studyId string) {
	// This function will handle the creation of new assets for a specific study.
	// For now, we will return a placeholder response.
	ctx.JSON(http.StatusOK, gin.H{
		"message": "Study asset creation is not yet implemented.",
		"studyId": studyId,
	})
}
