package web

import (
	"fmt"
	"net/http"
	"time"

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

func assetToOpenApiAsset(asset types.Asset) openapi.Asset {
	return openapi.Asset{
		Id:                   asset.ID.String(),
		CreatorUserId:        asset.CreatorUserID.String(),
		StudyId:              asset.StudyID.String(),
		Title:                asset.Title,
		Description:          asset.Description,
		ClassificationImpact: openapi.AssetClassificationImpact(asset.ClassificationImpact),
		Protection:           openapi.AssetProtection(asset.Protection),
		LegalBasis:           asset.LegalBasis,
		Format:               openapi.AssetFormat(asset.Format),
		ExpiresAt:            asset.ExpiresAt.Format(config.TimeFormat),
		Locations:            asset.LocationStrings(),
		RequiresContract:     asset.RequiresContract,
		HasDspt:              asset.HasDspt,
		StoredOutsideUkEea:   asset.StoredOutsideUkEea,
		Status:               openapi.AssetStatus(asset.Status),
		CreatedAt:            asset.CreatedAt.Format(config.TimeFormat),
		UpdatedAt:            asset.UpdatedAt.Format(config.TimeFormat),
	}
}

func contractToOpenApiContract(contract types.Contract) openapi.Contract {
	return openapi.Contract{
		Id:                    contract.ID.String(),
		Filename:              contract.Filename,
		OrganisationSignatory: contract.OrganisationSignatory,
		ThirdPartyName:        contract.ThirdPartyName,
		Status:                openapi.ContractStatus(contract.Status),
		ExpiryDate:            contract.ExpiryDate.Format(config.TimeFormat),
		CreatedAt:             contract.CreatedAt.Format(config.TimeFormat),
		UpdatedAt:             contract.UpdatedAt.Format(config.TimeFormat),
	}
}

func (h *Handler) GetStudies(ctx *gin.Context) {
	user := middleware.GetUser(ctx)

	var studies []types.Study

	isAdmin, err := rbac.HasRole(user, rbac.Admin)
	if err != nil {
		setError(ctx, err, "Failed to check user roles")
		return
	}

	if isAdmin {
		// Admins can see all studies
		studies, err = h.studies.AllStudies()
		if err != nil {
			setError(ctx, err, "Failed to get studies")
			return
		}
	} else {
		// Non-admin users can only see studies they own
		var studyIds []uuid.UUID
		studyIds, err = rbac.StudyIDsWithRole(user, rbac.StudyOwner)
		if err != nil {
			setError(ctx, err, "Failed to get user's study access")
			return
		}

		studies, err = h.studies.StudiesById(studyIds...)
		if err != nil {
			setError(ctx, err, "Failed to get studies")
			return
		}
	}

	response := []openapi.Study{}
	for _, study := range studies {
		response = append(response, studyToOpenApiStudy(study))
	}

	ctx.JSON(http.StatusOK, response)
}

func (h *Handler) GetStudiesStudyId(ctx *gin.Context, studyId string) {
	studyUUID, err := parseUUIDOrSetError(ctx, studyId)
	if err != nil {
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
	studyUUID, err := parseUUIDOrSetError(ctx, studyId)
	if err != nil {
		return
	}

	assets, err := h.studies.StudyAssets(studyUUID)
	if err != nil {
		setError(ctx, err, "Failed to retrieve assets")
		return
	}

	response := []openapi.Asset{}
	for _, asset := range assets {
		response = append(response, assetToOpenApiAsset(asset))
	}

	ctx.JSON(http.StatusOK, response)
}

func (h *Handler) PostStudiesStudyIdAssets(ctx *gin.Context, studyId string) {
	studyUUID, err := parseUUIDOrSetError(ctx, studyId)
	if err != nil {
		return
	}

	assetData := openapi.AssetBase{}
	if err := bindJSONOrSetError(ctx, &assetData); err != nil {
		return
	}

	user := middleware.GetUser(ctx)
	validationError, err := h.studies.CreateAsset(ctx, user, assetData, studyUUID)
	if err != nil {
		setError(ctx, err, "Failed to create asset")
		return
	} else if validationError != nil {
		ctx.JSON(http.StatusBadRequest, *validationError)
		return
	}

	ctx.Status(http.StatusCreated)
}

func (h *Handler) GetStudiesStudyIdAssetsAssetId(ctx *gin.Context, studyId string, assetId string) {
	studyUUID, err := parseUUIDOrSetError(ctx, studyId)
	if err != nil {
		return
	}

	assetUUID, err := parseUUIDOrSetError(ctx, assetId)
	if err != nil {
		return
	}

	user := middleware.GetUser(ctx)

	asset, err := h.studies.StudyAssetById(user, studyUUID, assetUUID)
	if err != nil {
		setError(ctx, err, "Failed to retrieve asset")
		return
	}

	ctx.JSON(http.StatusOK, assetToOpenApiAsset(asset))
}

// confirms a study agreement for the study ID and user
func (h *Handler) PostStudiesStudyIdAgreements(ctx *gin.Context, studyId string) {
	studyUUID, err := parseUUIDOrSetError(ctx, studyId)
	if err != nil {
		return
	}

	confirmation := openapi.AgreementConfirmation{}
	if err := bindJSONOrSetError(ctx, &confirmation); err != nil {
		return
	}

	agreementId, err := parseUUIDOrSetError(ctx, confirmation.AgreementId)
	if err != nil {
		return
	}

	user := middleware.GetUser(ctx)
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
	studyUUID, err := parseUUIDOrSetError(ctx, studyId)
	if err != nil {
		return
	}

	user := middleware.GetUser(ctx)
	signatures, err := h.studies.GetStudyAgreementSignatures(user, studyUUID)
	if err != nil {
		setError(ctx, err, "Failed to get study agreements")
		return
	}

	ctx.JSON(http.StatusOK, openapi.UserAgreements{
		ConfirmedAgreements: signatures,
	})
}

func (h *Handler) PostStudiesStudyIdAssetsAssetIdContractsUpload(ctx *gin.Context, studyId string, assetId string) {
	uuids, err := parseUUIDsOrSetError(ctx, studyId, assetId)
	if err != nil {
		return
	}

	// Get the uploaded file
	fileHeader, err := ctx.FormFile("file")
	if err != nil {
		setError(ctx, types.NewErrServerError(err), "Failed to get uploaded file")
		return
	}

	// Create contract metadata for validation
	contractMetadata := openapi.ContractUploadObject{
		OrganisationSignatory: ctx.PostForm("organisation_signatory"),
		ThirdPartyName:        ctx.PostForm("third_party_name"),
		Status:                openapi.ContractUploadObjectStatus(ctx.PostForm("status")),
		ExpiryDate:            ctx.PostForm("expiry_date"),
	}

	validationError := h.studies.ValidateContractMetadata(contractMetadata, fileHeader.Filename)
	if validationError != nil {
		ctx.JSON(http.StatusBadRequest, *validationError)
		return
	}

	// Parse expiry date
	expiryDate, err := time.Parse(config.DateFormat, contractMetadata.ExpiryDate)
	if err != nil {
		setError(ctx, types.NewErrServerError(err), "Invalid expiry date format")
		return
	}

	user := middleware.GetUser(ctx)

	// Open the uploaded file
	file, err := fileHeader.Open()
	if err != nil {
		setError(ctx, types.NewErrServerError(err), "Failed to open uploaded file")
		return
	}
	defer func() {
		if err := file.Close(); err != nil {
			log.Error().Err(err).Msg("Failed to close uploaded file")
		}
	}()

	// Create the final contract record for storage
	contractData := types.Contract{
		AssetID:               uuids[1],
		Filename:              fileHeader.Filename,
		CreatorUserID:         user.ID,
		OrganisationSignatory: contractMetadata.OrganisationSignatory,
		ThirdPartyName:        contractMetadata.ThirdPartyName,
		Status:                string(contractMetadata.Status),
		ExpiryDate:            expiryDate,
	}

	contractObj := types.S3Object{
		Content: file,
	}
	err = h.studies.StoreContract(ctx, contractObj, contractData)
	if err != nil {
		setError(ctx, err, "Failed to store contract")
		return
	}

	ctx.Status(http.StatusNoContent)
}

func (h *Handler) GetStudiesStudyIdAssetsAssetIdContracts(ctx *gin.Context, studyId string, assetId string) {
	uuids, err := parseUUIDsOrSetError(ctx, studyId, assetId)
	if err != nil {
		return
	}

	user := middleware.GetUser(ctx)

	contracts, err := h.studies.AssetContracts(user, uuids[1])
	if err != nil {
		setError(ctx, err, "Failed to retrieve contracts")
		return
	}

	apiContracts := []openapi.Contract{}
	for _, contract := range contracts {
		apiContracts = append(apiContracts, contractToOpenApiContract(contract))
	}
	ctx.JSON(http.StatusOK, apiContracts)
}

func (h *Handler) GetStudiesStudyIdAssetsAssetIdContractsContractIdDownload(ctx *gin.Context, studyId string, assetId string, contractId string) {
	uuids, err := parseUUIDsOrSetError(ctx, studyId, assetId, contractId)
	if err != nil {
		return
	}
	object, err := h.studies.GetContract(ctx, uuids[0], uuids[1], uuids[2])
	if err != nil {
		setError(ctx, err, "Failed get contract")
		return
	} else if object.NumBytes == nil {
		setError(ctx, types.NewErrServerError("contract object missing content length"), "Failed get contract")
		return
	}
	ctx.DataFromReader(
		http.StatusOK,
		*object.NumBytes,
		"application/octet-stream",
		object.Content, map[string]string{
			"Content-Disposition": "attachment; filename=contract.txt", // todo set filename
		},
	)
}
