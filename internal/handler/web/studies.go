package web

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/service/agreements"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func studyToOpenApiStudy(study types.Study) openapi.Study {
	ownerUserIDStr := study.OwnerUserID.String()
	return openapi.Study{
		Id:                               study.ID.String(),
		Title:                            study.Title,
		Description:                      study.Description,
		OwnerUserId:                      &ownerUserIDStr,
		ApprovalStatus:                   openapi.StudyApprovalStatus(study.ApprovalStatus),
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
	}
}

func (h *Handler) GetStudies(ctx *gin.Context) {
	user := middleware.GetUser(ctx)
	studies, err := h.studies.Studies(user)
	if err != nil {
		setError(ctx, err, "Failed to get studies")
		return
	}

	response := []openapi.Study{}
	for _, study := range studies {
		response = append(response, studyToOpenApiStudy(study))
	}

	ctx.JSON(http.StatusOK, response)
}

func (h *Handler) GetStudiesStudyId(ctx *gin.Context, studyId string) {
	studyUUID, err := uuid.Parse(studyId)
	if err != nil {
		setError(ctx, types.NewErrInvalidObject(err), "Invalid study ID format")
		return
	}

	studies, err := h.studies.StudiesById(studyUUID)
	if err != nil {
		setError(ctx, err, "Failed to retrieve study")
		return
	}
	if len(studies) == 0 {
		setError(ctx, types.NewNotFoundError(fmt.Errorf("study [%v] not found", studyUUID)), "Not found")
		return
	}

	ctx.JSON(http.StatusOK, studyToOpenApiStudy(studies[0]))
}

func (h *Handler) PostStudies(ctx *gin.Context) {
	studyData := openapi.StudyCreateRequest{}
	if err := bindJSONOrSetError(ctx, &studyData); err != nil {
		return
	}

	user := middleware.GetUser(ctx)
	validationError, err := h.studies.CreateStudy(ctx, user, studyData)
	if err != nil {
		setError(ctx, err, "Failed to create study")
		return
	} else if validationError != nil {
		ctx.JSON(http.StatusBadRequest, *validationError)
		return
	}

	ctx.Status(http.StatusCreated)
}

func (h *Handler) GetStudiesStudyIdAssets(ctx *gin.Context, studyId string) {
	studyUUID, err := uuid.Parse(studyId)
	if err != nil {
		setError(ctx, types.NewErrInvalidObject(err), "Invalid study ID format")
		return
	}

	assets, err := h.studies.StudyAssets(studyUUID)
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
			Format:                 openapi.AssetFormat(asset.Format),
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
	log.Info().Msg("Asset creation post route")

	AssetData := openapi.AssetBase{}
	if err := bindJSONOrSetError(ctx, &AssetData); err != nil {
		return
	}

	user := middleware.GetUser(ctx)
	validationError, err := h.studies.CreateAsset(ctx, user, AssetData, studyId)
	if err != nil {
		setError(ctx, err, "Failed to create asset")
		return
	} else if validationError != nil {
		ctx.JSON(http.StatusBadRequest, *validationError)
		return
	}

	ctx.Status(http.StatusCreated)
}

// confirms a study agreement for the study ID and user
func (h *Handler) PostStudiesStudyIdAgreements(ctx *gin.Context, studyId string) {
	user := middleware.GetUser(ctx)

	studyUUID, err := uuid.Parse(studyId)
	if err != nil {
		setError(ctx, types.NewErrInvalidObject(err), "Invalid study ID format")
		return
	}

	confirmation := openapi.AgreementConfirmation{}
	if err := bindJSONOrSetError(ctx, &confirmation); err != nil {
		return
	}

	agreementId, err := uuid.Parse(confirmation.AgreementId)
	if err != nil {
		setError(ctx, types.NewErrInvalidObject(err), "Invalid agreement ID")
		return
	}

	if err := h.studies.ConfirmStudyAgreement(user, studyUUID, agreementId); err != nil {
		setError(ctx, err, "Failed to confirm study agreement")
		return
	}

	agreementType, err := h.agreements.AgreementTypeById(agreementId)
	if err != nil {
		setError(ctx, err, "Failed to get agreement type")
		return
	}
	switch *agreementType {
	case agreements.StudyOwnerType:
		if _, err := rbac.AddRole(user, rbac.InformationAssetOwner); err != nil {
			setError(ctx, err, "Failed to assign IAO role")
			return
		}
	}

	ctx.Status(http.StatusOK)
}

func (h *Handler) GetStudiesStudyIdAgreements(ctx *gin.Context, studyId string) {
	user := middleware.GetUser(ctx)

	studyUUID, err := uuid.Parse(studyId)
	if err != nil {
		setError(ctx, types.NewErrInvalidObject(err), "Invalid study ID format")
		return
	}

	signatures, err := h.studies.GetStudyAgreementSignatures(user, studyUUID)
	if err != nil {
		setError(ctx, err, "Failed to get study agreements")
		return
	}

	ctx.JSON(http.StatusOK, openapi.UserAgreements{
		ConfirmedAgreements: signatures,
	})
}
