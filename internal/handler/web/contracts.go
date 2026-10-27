package web

import (
	"net/http"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
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
func (h *Handler) PostStudiesStudyIdContracts(ctx *gin.Context, studyId uuid.UUID) {

	var data openapi.ContractBase
	if err := bindJSONOrSetError(ctx, &data); err != nil {
		return
	}

	creator := middleware.GetUser(ctx)
	contract, err := h.studies.CreateContract(ctx, studyId, data, creator)
	if err != nil {
		setError(ctx, err, "Failed to create contract")
		return
	}

	ctx.JSON(http.StatusOK, contractToOpenApiContract(*contract))
}

func (h *Handler) GetStudiesStudyIdContractsContractId(ctx *gin.Context, studyId uuid.UUID, contractId uuid.UUID) {
	contract, err := h.studies.GetContract(studyId, contractId)
	if err != nil {
		setError(ctx, err, "Failed to get contract")
		return
	}
	ctx.JSON(http.StatusOK, contractToOpenApiContract(*contract))
}

func (h *Handler) PostStudiesStudyIdContractsContractIdObjects(ctx *gin.Context, studyId uuid.UUID, contractId uuid.UUID) {
	fileHeader, err := ctx.FormFile("file")
	if err != nil {
		setError(ctx, types.NewErrInvalidObject(err), "Failed to get uploaded file")
		return
	}

	// Open the uploaded file
	file, err := fileHeader.Open()
	log.Debug().Msgf("Opened uploaded file [%v]", file)
	if err != nil {
		setError(ctx, types.NewErrServerError(err), "Failed to open uploaded file")
		return
	}
	defer func() {
		if err := file.Close(); err != nil {
			log.Err(err).Msg("Failed to close uploaded file")
		}
	}()
	fileExtension := strings.ToLower(filepath.Ext(fileHeader.Filename))

	if mimeType, err := validation.MimeType(file); err != nil {
		setError(ctx, err, "Failed to determine MIME type of file")
		return
	} else if fileExtension == ".doc" &&
		(mimeType == types.MimeTypeOctetStream || mimeType == types.MimeTypeDoc) {
		// doc files can have generic MIME type
	} else if fileExtension == ".docx" &&
		(mimeType == types.MimeTypeZip || mimeType == types.MimeTypeDocx) {
		// docx files can have a ZIP file type
	} else if !validation.IsValidContractMimeType(mimeType) {
		setError(ctx, types.NewErrInvalidObjectF("mime type was [%v] not valid", mimeType), "Invalid MIME type")
		return
	}

	contractObject := studies.ContractObject{
		Meta: types.ContractObjectMetadata{
			Filename:   fileHeader.Filename,
			ContractID: contractId,
		},
		Object: types.S3Object{Content: file},
	}
	metadata, err := h.studies.CreateContractObject(ctx, studyId, contractObject)
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

func (h *Handler) DeleteStudiesStudyIdContractsContractId(ctx *gin.Context, studyId uuid.UUID, contractId uuid.UUID) {
	if err := h.studies.DeleteContract(studyId, contractId); err != nil {
		setError(ctx, err, "Failed to delete contract")
		return
	}

	ctx.Status(http.StatusNoContent)
}

func (h *Handler) PutStudiesStudyIdContractsContractId(ctx *gin.Context, studyId uuid.UUID, contractId uuid.UUID) {
	var data openapi.ContractBase
	if err := bindJSONOrSetError(ctx, &data); err != nil {
		return
	}

	contract, err := h.studies.UpdateContract(ctx, studyId, contractId, data)
	if err != nil {
		setError(ctx, err, "Failed to update contract")
		return
	}

	ctx.JSON(http.StatusOK, contractToOpenApiContract(*contract))
}

func (h *Handler) GetStudiesStudyIdContracts(ctx *gin.Context, studyId uuid.UUID) {
	contracts, err := h.studies.StudyContracts(studyId)
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

func (h *Handler) GetStudiesStudyIdAssetsAssetIdContracts(ctx *gin.Context, studyId uuid.UUID, assetId uuid.UUID) {
	contracts, err := h.studies.AssetContracts(studyId, assetId)
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
	studyId uuid.UUID,
	contractId uuid.UUID,
	contractObjectId uuid.UUID,
) {
	object, err := h.studies.GetContractObject(ctx, studyId, contractId, contractObjectId)
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
	studyId uuid.UUID,
	contractId uuid.UUID,
	contractObjectId uuid.UUID,
) {
	err := h.studies.DeleteContractObject(ctx, studyId, contractId, contractObjectId)
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
		OrganisationSignatory: new(string(contract.SignatoryUser.Username)),
		ThirdPartyName:        contract.ThirdPartyName,
		OtherSignatories:      contract.OtherSignatories,
		Status:                openapi.ContractStatus(contract.Status),
		CreatedAt:             openapi.FormatTime(contract.CreatedAt),
		UpdatedAt:             openapi.FormatTime(contract.UpdatedAt),
		StudyId:               contract.StudyID.String(),
		ObjectsMetadata:       []openapi.ContractObjectMetadata{},
		AssetIds:              []string{},
		StartDate:             openapi.FormatOptionalDate(contract.StartDate),
		ExpiryDate:            openapi.FormatOptionalDate(contract.ExpiryDate),
		RetentionEndDate:      openapi.FormatOptionalDate(contract.RetentionEndDate),
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
