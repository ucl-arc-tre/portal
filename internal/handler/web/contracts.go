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
	"github.com/ucl-arc-tre/portal/internal/types"
	"github.com/ucl-arc-tre/portal/internal/validation"
)

// Helper functions

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
		AssetIds:              ctx.PostFormArray("asset_ids"),
	}
}

func contractToOpenApiContract(contract types.Contract) openapi.Contract {

	assetIds := []string{}
	log.Debug().Any("contract", contract).Int("numAssets", len(contract.Assets)).Msg("within contractToOpenApiContract")
	for _, asset := range contract.Assets {
		assetIds = append(assetIds, asset.ID.String())
	}

	log.Debug().Any("assetIds", assetIds).Msg("within contractToOpenApiContract")
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
		AssetIds:              assetIds,
		StudyId:               contract.StudyID.String(),
	}
}

// Handler methods

func (h *Handler) PostStudiesStudyIdContractsUpload(ctx *gin.Context, studyId string) {
	uuids, err := parseUUIDsOrSetError(ctx, studyId)
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

	if mimeType, err := validation.MimeType(file); err != nil {
		setError(ctx, err, "Failed to determine MIME type of file")
		return
	} else if mimeType != types.MimeTypePdf {
		setError(ctx, types.NewErrInvalidObject(fmt.Errorf("mime type was [%v] not PDF", mimeType)), "Invalid MIME type")
		return
	}

	assets := []types.Asset{}
	if contractMetadata.AssetIds != nil {
		assetUuids, err := parseUUIDsOrSetError(ctx, contractMetadata.AssetIds...)
		if err != nil {
			return
		}
		for _, assetUuid := range assetUuids {
			assets = append(assets, types.Asset{ModelAuditable: types.ModelAuditable{Model: types.Model{ID: assetUuid}}})
		}
	}
	// Create the final contract record for storage
	contractData := types.Contract{
		StudyID:               uuids[0],
		Filename:              fileHeader.Filename,
		CreatorUserID:         user.ID,
		OrganisationSignatory: contractMetadata.OrganisationSignatory,
		ThirdPartyName:        contractMetadata.ThirdPartyName,
		Status:                string(contractMetadata.Status),
		StartDate:             mustParseDate(contractMetadata.StartDate),
		ExpiryDate:            mustParseDate(contractMetadata.ExpiryDate),

		Assets: assets,
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

func (h *Handler) PutStudiesStudyIdContractsContractId(ctx *gin.Context, studyId string, contractId string) {
	uuids, err := parseUUIDsOrSetError(ctx, studyId, contractId)
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

		if mimeType, err := validation.MimeType(file); err != nil {
			setError(ctx, err, "Failed to determine MIME type of file")
			return
		} else if mimeType != types.MimeTypePdf {
			setError(ctx, types.NewErrInvalidObject(fmt.Errorf("mime type was [%v] not PDF", mimeType)), "Invalid MIME type")
			return
		}

		contractObj = &types.S3Object{
			Content: file,
		}
	}

	assets := []types.Asset{}

	if contractMetadata.AssetIds != nil {
		assetUuids, err := parseUUIDsOrSetError(ctx, contractMetadata.AssetIds...)

		if err != nil {
			return
		}
		for _, assetUuid := range assetUuids {
			assets = append(assets, types.Asset{ModelAuditable: types.ModelAuditable{Model: types.Model{ID: assetUuid}}})
		}

	}
	contractUpdateData := types.Contract{
		ModelAuditable:        types.ModelAuditable{Model: types.Model{ID: uuids[1]}},
		StudyID:               uuids[0],
		OrganisationSignatory: contractMetadata.OrganisationSignatory,
		ThirdPartyName:        contractMetadata.ThirdPartyName,
		Status:                string(contractMetadata.Status),
		StartDate:             mustParseDate(contractMetadata.StartDate),
		ExpiryDate:            mustParseDate(contractMetadata.ExpiryDate),
		Filename:              filename,

		Assets: assets,
	}

	err = h.studies.UpdateContract(ctx, uuids[0], uuids[1], contractUpdateData, contractObj)
	if err != nil {
		setError(ctx, err, "Failed to update contract")
		return
	}

	ctx.Status(http.StatusNoContent)
}

func (h *Handler) GetStudiesStudyIdContracts(ctx *gin.Context, studyId string) {
	uuids, err := parseUUIDsOrSetError(ctx, studyId)
	if err != nil {
		return
	}

	contracts, err := h.studies.StudyContracts(uuids[0])
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

	log.Debug().Int("num_contracts", len(contracts)).Msg("Retrieved contracts for asset")

	apiContracts := []openapi.Contract{}
	for _, contract := range contracts {
		apiContracts = append(apiContracts, contractToOpenApiContract(contract))
	}
	ctx.JSON(http.StatusOK, apiContracts)
}

func (h *Handler) GetStudiesStudyIdContractsContractIdDownload(ctx *gin.Context, studyId string, contractId string) {
	uuids, err := parseUUIDsOrSetError(ctx, studyId, contractId)
	if err != nil {
		return
	}
	object, err := h.studies.GetContract(ctx, uuids[0], uuids[2])
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
		"application/pdf",
		object.Content, map[string]string{
			"Content-Disposition": "attachment",
		},
	)
}
