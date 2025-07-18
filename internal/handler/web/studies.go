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
		response = append(response, openapi.Study{
			Id:                   study.ID.String(),
			Title:                study.Title,
			Description:          study.Description,
			OwnerUserId:          &ownerUserIDStr,
			Admin:                study.Admin,
			Controller:           openapi.StudyController(study.Controller),
			ControllerOther:      study.ControllerOther,
			UclSponsorship:       study.UclSponsorship,
			Cag:                  study.Cag,
			CagRef:               study.CagRef,
			Ethics:               study.Ethics,
			Hra:                  study.Hra,
			IrasId:               study.IrasId,
			Nhs:                  study.Nhs,
			NhsEngland:           study.NhsEngland,
			NhsEnglandRef:        study.NhsEnglandRef,
			Mnca:                 study.Mnca,
			Dspt:                 study.Dspt,
			Dbs:                  study.Dbs,
			DataProtection:       study.DataProtection,
			DataProtectionPrefix: study.DataProtectionPrefix,
			DataProtectionDate:   study.DataProtectionDate,
			DataProtectionId:     study.DataProtectionId,
			DataProtectionNumber: study.DataProtectionNumber,
			ThirdParty:           study.ThirdParty,
			ExternalUsers:        study.ExternalUsers,
			Consent:              study.Consent,
			NonConsent:           study.NonConsent,
			ExtEea:               study.ExtEea,
			CreatedAt:            study.CreatedAt.Format(config.TimeFormat),
			UpdatedAt:            study.UpdatedAt.Format(config.TimeFormat),
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

	createdStudy, err := h.studies.CreateStudy(user.ID, studyData)
	if err != nil {
		setError(ctx, err, "Failed to create study")
		return
	}

	ownerUserIDStr := createdStudy.OwnerUserID.String()
	response := openapi.Study{
		Id:                   createdStudy.ID.String(),
		Title:                createdStudy.Title,
		Description:          createdStudy.Description,
		OwnerUserId:          &ownerUserIDStr,
		Admin:                createdStudy.Admin,
		Controller:           openapi.StudyController(createdStudy.Controller),
		ControllerOther:      createdStudy.ControllerOther,
		UclSponsorship:       createdStudy.UclSponsorship,
		Cag:                  createdStudy.Cag,
		CagRef:               createdStudy.CagRef,
		Ethics:               createdStudy.Ethics,
		Hra:                  createdStudy.Hra,
		IrasId:               createdStudy.IrasId,
		Nhs:                  createdStudy.Nhs,
		NhsEngland:           createdStudy.NhsEngland,
		NhsEnglandRef:        createdStudy.NhsEnglandRef,
		Mnca:                 createdStudy.Mnca,
		Dspt:                 createdStudy.Dspt,
		Dbs:                  createdStudy.Dbs,
		DataProtection:       createdStudy.DataProtection,
		DataProtectionPrefix: createdStudy.DataProtectionPrefix,
		DataProtectionDate:   createdStudy.DataProtectionDate,
		DataProtectionId:     createdStudy.DataProtectionId,
		DataProtectionNumber: createdStudy.DataProtectionNumber,
		ThirdParty:           createdStudy.ThirdParty,
		ExternalUsers:        createdStudy.ExternalUsers,
		Consent:              createdStudy.Consent,
		NonConsent:           createdStudy.NonConsent,
		ExtEea:               createdStudy.ExtEea,
		CreatedAt:            createdStudy.CreatedAt.Format(config.TimeFormat),
		UpdatedAt:            createdStudy.UpdatedAt.Format(config.TimeFormat),
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
