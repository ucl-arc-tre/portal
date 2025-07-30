package web

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
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
			Id:                               study.ID.String(),
			Title:                            study.Title,
			Description:                      study.Description,
			OwnerUserId:                      &ownerUserIDStr,
			AdditionalStudyAdminUsernames:    study.AdminUsernames(),
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
	if err := bindJSONOrSetError(ctx, &studyData); err != nil {
		return
	}

	err := h.studies.CreateStudy(ctx, user, studyData)
	if err != nil {
		// Check if this is a validation error or conflict (both should be HTTP 400)
		if errors.Is(err, types.ErrInvalidObject) || errors.Is(err, types.ErrConflict) {
			validationError := openapi.StudyCreateValidationError{
				ErrorMessage: err.Error(),
			}
			ctx.JSON(http.StatusBadRequest, validationError)
			return
		}

		// Check if this is a server error (database, entra, etc.)
		if errors.Is(err, types.ErrServerError) {
			setError(ctx, err, "Failed to create study")
			return
		}

		// Any other error types
		setError(ctx, err, "Failed to create study")
		return
	}

	// Success response
	message := "Study created successfully"
	successResponse := openapi.StudyCreateResponse{
		Message: &message,
	}
	ctx.JSON(http.StatusCreated, successResponse)
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
		setError(ctx, err, "Failed to retrieve assets")
		return
	}

	// prepare the final response
	var response []openapi.Asset
	for _, asset := range assets {

		response = append(response, openapi.Asset{
			Id:                     asset.ID.String(),
			Title:                  asset.Title,
			Description:            asset.Description,
			ClassificationImpact:   openapi.AssetClassificationImpact(asset.ClassificationImpact),
			Protection:             openapi.AssetProtection(asset.Protection),
			LegalBasis:             asset.LegalBasis,
			Format:                 asset.Format,
			Expiry:                 asset.Expiry,
			Locations:              asset.LocationStrings(),
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
