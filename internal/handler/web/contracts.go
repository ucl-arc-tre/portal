package web

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/service/studies"
	"github.com/ucl-arc-tre/portal/internal/types"
	"github.com/ucl-arc-tre/portal/internal/validation"
)

var (
	attachmentHeaders = map[string]string{"Content-Disposition": "attachment"}
)

// Handler methods
func (h *Handler) PostStudiesStudyIdContracts(ctx *gin.Context, studyId string) {
	studyUuid, err := parseUUIDOrSetError(ctx, studyId)
	if err != nil {
		return
	}

	var data openapi.ContractBase
	if err := bindJSONOrSetError(ctx, &data); err != nil {
		return
	}

	validationError := h.studies.ValidateContract(ctx, studyUuid, data)
	if validationError != nil {
		ctx.JSON(http.StatusBadRequest, *validationError)
		return
	}

	creator := middleware.GetUser(ctx)
	contract, err := h.studies.CreateContract(ctx, studyUuid, data, creator)
	if err != nil {
		setError(ctx, err, "Failed to create contract")
		return
	}

	ctx.JSON(http.StatusOK, contractToOpenApiContract(*contract))
}

func (h *Handler) GetStudiesStudyIdContractsContractId(ctx *gin.Context, studyId string, contractId string) {
	uuids, err := parseUUIDsOrSetError(ctx, studyId, contractId)
	if err != nil {
		return
	}

	contract, err := h.studies.GetContract(uuids[0], uuids[1])
	if err != nil {
		setError(ctx, err, "Failed to get contract")
		return
	}
	ctx.JSON(http.StatusOK, contractToOpenApiContract(*contract))
}

func (h *Handler) PostStudiesStudyIdContractsContractIdObjects(ctx *gin.Context, studyId string, contractId string) {
	uuids, err := parseUUIDsOrSetError(ctx, studyId, contractId)
	if err != nil {
		return
	}

	fileHeader, err := ctx.FormFile("file")
	if err != nil {
		setError(ctx, types.NewErrInvalidObject(err), "Failed to get uploaded file")
		return
	}

	// Open the uploaded file
	file, err := fileHeader.Open()
	if err != nil {
		setError(ctx, types.NewErrServerError(err), "Failed to open uploaded file")
		return
	}
	defer func() {
		if err := file.Close(); err != nil {
			log.Err(err).Msg("Failed to close uploaded file")
		}
	}()

	if mimeType, err := validation.MimeType(file); err != nil {
		setError(ctx, err, "Failed to determine MIME type of file")
		return
	} else if !validation.IsValidContractMimeType(mimeType) {
		setError(ctx, types.NewErrInvalidObject(fmt.Errorf("mime type was [%v] not valid", mimeType)), "Invalid MIME type")
		return
	}

	contractObject := studies.ContractObject{
		Meta: types.ContractObjectMetadata{
			Filename:   fileHeader.Filename,
			ContractID: uuids[1],
		},
		Object: types.S3Object{Content: file},
	}
	metadata, err := h.studies.CreateContractObject(ctx, uuids[0], contractObject)
	if err != nil {
		setError(ctx, err, "Failed to store contract")
		return
	}

	ctx.JSON(http.StatusOK, openapi.ContractObjectMetadata{
		Filename:  metadata.Filename,
		Id:        metadata.ID.String(),
		CreatedAt: openapi.FormatTime(metadata.CreatedAt),
	})
}

func (h *Handler) PutStudiesStudyIdContractsContractId(ctx *gin.Context, studyId string, contractId string) {
	uuids, err := parseUUIDsOrSetError(ctx, studyId, contractId)
	if err != nil {
		return
	}

	var data openapi.ContractBase
	if err := bindJSONOrSetError(ctx, &data); err != nil {
		return
	}

	validationError := h.studies.ValidateContract(ctx, uuids[0], data)
	if validationError != nil {
		ctx.JSON(http.StatusBadRequest, *validationError)
		return
	}

	contract, err := h.studies.UpdateContract(ctx, uuids[0], uuids[1], data)
	if err != nil {
		setError(ctx, err, "Failed to update contract")
		return
	}

	ctx.JSON(http.StatusOK, contractToOpenApiContract(*contract))
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

	apiContracts := []openapi.Contract{}
	for _, contract := range contracts {
		apiContracts = append(apiContracts, contractToOpenApiContract(contract))
	}
	ctx.JSON(http.StatusOK, apiContracts)
}

func (h *Handler) GetStudiesStudyIdContractsContractIdObjectsContractObjectId(
	ctx *gin.Context,
	studyId string,
	contractId string,
	contractObjectId string,
) {
	uuids, err := parseUUIDsOrSetError(ctx, studyId, contractId, contractObjectId)
	if err != nil {
		return
	}
	object, err := h.studies.GetContractObject(ctx, uuids[0], uuids[1], uuids[2])
	if err != nil {
		setError(ctx, err, "Failed get contract object")
		return
	} else if object.NumBytes == nil {
		setError(ctx, types.NewErrServerError("contract object missing content length"), "Failed get contract")
		return
	}
	ctx.DataFromReader(
		http.StatusOK,
		*object.NumBytes,
		"application/octet-stream",
		object.Content,
		attachmentHeaders,
	)
}

func (h *Handler) DeleteStudiesStudyIdContractsContractIdObjectsContractObjectId(
	ctx *gin.Context,
	studyId string,
	contractId string,
	contractObjectId string,
) {
	uuids, err := parseUUIDsOrSetError(ctx, studyId, contractId, contractObjectId)
	if err != nil {
		return
	}

	err = h.studies.DeleteContractObject(ctx, uuids[0], uuids[1], uuids[2])
	if err != nil {
		setError(ctx, err, "Failed delete contract object")
		return
	}
	ctx.Status(http.StatusNoContent)
}

// Helper functions

func contractToOpenApiContract(contract types.Contract) openapi.Contract {
	data := openapi.Contract{
		Id:                    contract.ID.String(),
		Title:                 contract.Title,
		OrganisationSignatory: string(contract.SignatoryUser.Username),
		ThirdPartyName:        contract.ThirdPartyName,
		OtherSignatories:      contract.OtherSignatories,
		Status:                openapi.ContractStatus(contract.Status),
		CreatedAt:             openapi.FormatTime(contract.CreatedAt),
		UpdatedAt:             openapi.FormatTime(contract.UpdatedAt),
		StudyId:               contract.StudyID.String(),
		ObjectsMetadata:       []openapi.ContractObjectMetadata{},
		AssetIds:              []string{},
		StartDate:             openapi.FormatOptionalTime(contract.StartDate),
		ExpiryDate:            openapi.FormatOptionalTime(contract.ExpiryDate),
	}
	for _, asset := range contract.Assets {
		data.AssetIds = append(data.AssetIds, asset.ID.String())
	}
	for _, object := range contract.Objects {
		data.ObjectsMetadata = append(data.ObjectsMetadata, openapi.ContractObjectMetadata{
			Filename:  object.Filename,
			Id:        object.ID.String(),
			CreatedAt: openapi.FormatTime(object.CreatedAt),
		})
	}
	return data
}
