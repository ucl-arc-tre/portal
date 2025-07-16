package web

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"gorm.io/gorm"
)

func (h *Handler) PostStudies(ctx *gin.Context) {
	// This function will handle the creation of a new study.
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
