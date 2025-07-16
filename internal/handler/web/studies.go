package web

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
	"gorm.io/gorm"
)

func (h *Handler) PostStudies(ctx *gin.Context) {
	user := middleware.GetUser(ctx)

	var request openapi.Study
	if err := ctx.ShouldBindJSON(&request); err != nil {
		setInvalid(ctx, err, "Invalid request body")
		return
	}

	// Convert OpenAPI request to database model
	studyData := types.Study{
		Title:                request.Title,
		Description:          request.Description,
		Controller:           string(request.Controller),
		Admin:                string(request.Admin),
		ControllerOther:      request.ControllerOther,
		UclSponsorship:       request.UclSponsorship,
		Cag:                  request.Cag,
		CagRef:               request.CagRef,
		Ethics:               request.Ethics,
		Hra:                  request.Hra,
		IrasId:               request.IrasId,
		Nhs:                  request.Nhs,
		NhsEngland:           request.NhsEngland,
		NhsEnglandRef:        request.NhsEnglandRef,
		Mnca:                 request.Mnca,
		Dspt:                 request.Dspt,
		Dbs:                  request.Dbs,
		DataProtection:       request.DataProtection,
		DataProtectionPrefix: request.DataProtectionPrefix,
		DataProtectionDate:   request.DataProtectionDate,
		DataProtectionId:     request.DataProtectionId,
		DataProtectionNumber: request.DataProtectionNumber,
		ThirdParty:           request.ThirdParty,
		ExternalUsers:        request.ExternalUsers,
		Consent:              request.Consent,
		NonConsent:           request.NonConsent,
		ExtEea:               request.ExtEea,
	}

	// Create the study
	createdStudy, err := h.studies.CreateStudy(user.ID, studyData)
	if err != nil {
		setServerError(ctx, err, "Failed to create study")
		return
	}

	ctx.JSON(http.StatusCreated, createdStudy)
}

func (h *Handler) GetStudiesStudyIdAssets(ctx *gin.Context, studyId string) {
	user := middleware.GetUser(ctx)

	studyUUID, err := uuid.Parse(studyId)
	if err != nil {
		setInvalid(ctx, err, "Invalid study ID format")
		return
	}

	assets, err := h.studies.GetStudyAssets(studyUUID, user.ID)

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			setInvalid(ctx, err, "Study not found or you don't have permission to access it")
			return
		}

		setServerError(ctx, err, "Failed to retrieve assets")
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
