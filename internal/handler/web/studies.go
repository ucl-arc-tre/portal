package web

import (
	"fmt"
	"net/http"

	"time"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/service/agreements"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func mustParseDate(dateStr string) time.Time {
	parsedDate, err := time.Parse(config.DateFormat, dateStr)
	if err != nil {
		panic(fmt.Sprintf("failed to parse date %q: %v", dateStr, err))
	}
	return parsedDate
}

func extractContractFormData(ctx *gin.Context) openapi.ContractUploadObject {
	return openapi.ContractUploadObject{
		OrganisationSignatory: ctx.PostForm("organisation_signatory"),
		ThirdPartyName:        ctx.PostForm("third_party_name"),
		Status:                openapi.ContractUploadObjectStatus(ctx.PostForm("status")),
		StartDate:             ctx.PostForm("start_date"),
		ExpiryDate:            ctx.PostForm("expiry_date"),
	}
}

func studyToOpenApiStudy(study types.Study) openapi.Study {
	ownerUserIDStr := study.OwnerUserID.String()
	ownerUsernameStr := string(study.Owner.Username)
	return openapi.Study{
		Id:                               study.ID.String(),
		Title:                            study.Title,
		Description:                      study.Description,
		OwnerUserId:                      &ownerUserIDStr,
		OwnerUsername:                    &ownerUsernameStr,
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
		Feedback:                         study.Feedback,
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
		Tier:                 asset.Tier,
		Protection:           openapi.AssetProtection(asset.Protection),
		LegalBasis:           openapi.AssetLegalBasis(asset.LegalBasis),
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
		StartDate:             contract.StartDate.Format(config.DateFormat),
		ExpiryDate:            contract.ExpiryDate.Format(config.DateFormat),
		CreatedAt:             contract.CreatedAt.Format(config.TimeFormat),
		UpdatedAt:             contract.UpdatedAt.Format(config.TimeFormat),
	}
}

func (h *Handler) studiesAdmin(params openapi.GetStudiesParams) ([]types.Study, error) {
	if params.Status != nil && openapi.StudyApprovalStatus(*params.Status) == openapi.Pending {
		// admins can see all pending studies
		return h.studies.PendingStudies()

	} else if params.Status != nil {
		return []types.Study{}, types.NewErrInvalidObject("Invalid query param")
	} else {
		// Admins can see all studies normally
		return h.studies.AllStudies()
	}

}

func (h *Handler) studiesStudyOwner(user types.User) ([]types.Study, error) {
	// Non-admin users can only see studies they own

	studyIds, err := rbac.StudyIDsWithRole(user, rbac.StudyOwner)
	if err != nil {
		return []types.Study{}, err
	}

	studies, err := h.studies.StudiesById(studyIds...)
	if err != nil {
		return []types.Study{}, err
	}

	return studies, nil
}

func (h *Handler) GetStudies(ctx *gin.Context, params openapi.GetStudiesParams) {
	user := middleware.GetUser(ctx)

	var studies []types.Study

	isAdmin, err := rbac.HasRole(user, rbac.Admin)
	if err != nil {
		setError(ctx, err, "Failed to check user roles")
		return
	}

	if isAdmin {

		studies, err = h.studiesAdmin(params)
		if err != nil {
			setError(ctx, err, "Failed to get studies for admin")
			return
		}

	} else {

		studies, err = h.studiesStudyOwner(user)
		if err != nil {
			setError(ctx, err, "Failed to get studies for study owner")
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
	studyData := openapi.StudyRequest{}
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

	assets, err := h.studies.InformationAssets(studyUUID)
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
	validationError, err := h.studies.CreateAsset(user, assetData, studyUUID)
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
	uuids, err := parseUUIDsOrSetError(ctx, studyId, assetId)
	if err != nil {
		return
	}

	asset, err := h.studies.InformationAssetById(uuids[0], uuids[1])
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
		setError(ctx, types.NewErrInvalidObject(err), "Failed to get uploaded file")
		return
	}

	contractMetadata := extractContractFormData(ctx)

	validationError := h.studies.ValidateContractMetadata(contractMetadata, fileHeader.Filename)
	if validationError != nil {
		ctx.JSON(http.StatusBadRequest, *validationError)
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
		StartDate:             mustParseDate(contractMetadata.StartDate),
		ExpiryDate:            mustParseDate(contractMetadata.ExpiryDate),
	}

	contractObj := types.S3Object{
		Content: file,
	}
	err = h.studies.StoreContract(ctx, uuids[0], contractObj, contractData)
	if err != nil {
		setError(ctx, err, "Failed to store contract")
		return
	}

	ctx.Status(http.StatusNoContent)
}

func (h *Handler) PutStudiesStudyIdAssetsAssetIdContractsContractId(ctx *gin.Context, studyId string, assetId string, contractId string) {
	uuids, err := parseUUIDsOrSetError(ctx, studyId, assetId, contractId)
	if err != nil {
		return
	}

	// Get optional uploaded file (don't error if no file provided)
	fileHeader, _ := ctx.FormFile("file")
	filename := ""
	if fileHeader != nil {
		filename = fileHeader.Filename
	}

	contractMetadata := extractContractFormData(ctx)

	validationError := h.studies.ValidateContractMetadata(contractMetadata, filename)
	if validationError != nil {
		ctx.JSON(http.StatusBadRequest, *validationError)
		return
	}

	// Handle file processing if a new file is provided
	var contractObj *types.S3Object
	if fileHeader != nil {
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

		contractObj = &types.S3Object{
			Content: file,
		}
	}

	contractUpdateData := types.Contract{
		ModelAuditable:        types.ModelAuditable{Model: types.Model{ID: uuids[2]}},
		AssetID:               uuids[1],
		OrganisationSignatory: contractMetadata.OrganisationSignatory,
		ThirdPartyName:        contractMetadata.ThirdPartyName,
		Status:                string(contractMetadata.Status),
		StartDate:             mustParseDate(contractMetadata.StartDate),
		ExpiryDate:            mustParseDate(contractMetadata.ExpiryDate),
		Filename:              filename,
	}

	err = h.studies.UpdateContract(ctx, uuids[0], uuids[2], contractUpdateData, contractObj)
	if err != nil {
		setError(ctx, err, "Failed to update contract")
		return
	}

	ctx.Status(http.StatusNoContent)
}

func (h *Handler) GetStudiesStudyIdAssetsAssetIdContracts(ctx *gin.Context, studyId string, assetId string) {
	uuids, err := parseUUIDsOrSetError(ctx, studyId, assetId)
	if err != nil {
		return
	}

	contracts, err := h.studies.AssetContracts(uuids[0], uuids[1])
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

func (h *Handler) PostStudiesAdminStudyIdReview(ctx *gin.Context, studyId string) {
	review := openapi.StudyReview{}
	if err := bindJSONOrSetError(ctx, &review); err != nil {
		return
	}

	studyUUID, err := parseUUIDOrSetError(ctx, studyId)
	if err != nil {
		return
	}

	// if status is approved then set feedback to nothing
	if review.Status == openapi.Approved {
		emptyReviewString := ""
		review.Feedback = &emptyReviewString
	}

	err = h.studies.UpdateStudyReview(studyUUID, review)
	if err != nil {
		setError(ctx, err, "Failed to update study feedback")
		return
	}

	err = h.studies.SendReviewEmailNotification(ctx, studyUUID, review)
	if err != nil {
		setError(ctx, err, "Failed to send study notification")
		return
	}

	ctx.Status(http.StatusOK)
}
func (h *Handler) PatchStudiesStudyIdPending(ctx *gin.Context, studyId string) {
	review := openapi.StudyReview{
		Status: openapi.Pending,
	}

	studyUUID, err := parseUUIDOrSetError(ctx, studyId)
	if err != nil {
		return
	}

	err = h.studies.UpdateStudyReview(studyUUID, review)
	if err != nil {
		setError(ctx, err, "Failed to update study feedback")
		return
	}

	ctx.Status(http.StatusOK)
}

func (h *Handler) PutStudiesStudyId(ctx *gin.Context, studyId string) {
	studyUUID, err := parseUUIDOrSetError(ctx, studyId)
	if err != nil {
		return
	}
	studyData := openapi.StudyRequest{}
	if err := bindJSONOrSetError(ctx, &studyData); err != nil {
		return
	}
	validationError, err := h.studies.ValidateStudyData(ctx, studyData, true)
	if err != nil {
		setError(ctx, err, "Failed to validate study data")
		return
	} else if validationError != nil {
		ctx.JSON(http.StatusBadRequest, *validationError)
		return
	}
	err = h.studies.UpdateStudy(studyUUID, studyData)
	if err != nil {
		setError(ctx, err, "Failed to update study")
		return
	}

	ctx.Status(http.StatusOK)
}
