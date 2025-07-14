package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	"gorm.io/gorm"
)

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

	// Prepare the final response format
	var response []map[string]any
	for _, asset := range assets {
		var locations []string
		for _, loc := range asset.Locations {
			locations = append(locations, loc.Location)
		}

		response = append(response, map[string]any{
			"id":                        asset.ID.String(),
			"title":                     asset.Title,
			"description":               asset.Description,
			"classification_impact":     asset.ClassificationImpact,
			"protection":                asset.Protection,
			"legal_basis":               asset.LegalBasis,
			"format":                    asset.Format,
			"expiry":                    asset.Expiry,
			"location":                  locations,
			"has_dspt":                  asset.HasDspt,
			"stored_outside_uk_eea":     asset.StoredOutsideUkEea,
			"accessed_by_third_parties": asset.AccessedByThirdParties,
			"status":                    asset.Status,
			"created_at":                asset.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			"updated_at":                asset.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
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
