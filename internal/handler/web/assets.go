package web

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func (h *Handler) GetStudiesStudyIdAssets(ctx *gin.Context, studyId string) {
	studyUUID, err := parseUUIDOrSetError(ctx, studyId)
	if err != nil {
		return
	}

	assets, err := h.studies.Assets(studyUUID)
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
	err = h.studies.CreateAsset(user, assetData, studyUUID)
	if err != nil {
		setError(ctx, err, "Failed to create asset")
		return
	}

	ctx.Status(http.StatusCreated)
}

func (h *Handler) GetStudiesStudyIdAssetsAssetId(ctx *gin.Context, studyId string, assetId string) {
	uuids, err := parseUUIDsOrSetError(ctx, studyId, assetId)
	if err != nil {
		return
	}

	asset, err := h.studies.AssetById(uuids[0], uuids[1])
	if err != nil {
		setError(ctx, err, "Failed to retrieve asset")
		return
	}

	ctx.JSON(http.StatusOK, assetToOpenApiAsset(asset))
}

func (h *Handler) PutStudiesStudyIdAssetsAssetId(ctx *gin.Context, studyId string, assetId string) {
	uuids, err := parseUUIDsOrSetError(ctx, studyId, assetId)
	if err != nil {
		return
	}

	var assetData openapi.AssetBase
	if err := bindJSONOrSetError(ctx, &assetData); err != nil {
		return
	}

	asset, err := h.studies.UpdateAsset(assetData, uuids[0], uuids[1])
	if err != nil {
		setError(ctx, err, "Failed to update asset")
		return
	}

	ctx.JSON(http.StatusOK, assetToOpenApiAsset(*asset))
}

func (h *Handler) DeleteStudiesStudyIdAssetsAssetId(
	ctx *gin.Context,
	studyId string,
	assetId string,
) {
	uuids, err := parseUUIDsOrSetError(ctx, studyId, assetId)
	if err != nil {
		return
	}

	err = h.studies.DeleteAsset(uuids[0], uuids[1])
	if err != nil {
		setError(ctx, err, "Failed to delete asset")
		return
	}

	ctx.Status(http.StatusNoContent)
}

// Helper functions

func assetToOpenApiAsset(data types.Asset) openapi.Asset {
	asset := openapi.Asset{
		Id:                   data.ID.String(),
		CreatorUserId:        data.CreatorUserID.String(),
		StudyId:              data.StudyID.String(),
		Title:                data.Title,
		Source:               data.Source,
		Description:          data.Description,
		ClassificationImpact: openapi.AssetClassificationImpact(data.ClassificationImpact),
		Tier:                 data.Tier,
		Protection:           openapi.AssetProtection(data.Protection),
		Format:               openapi.AssetFormat(data.Format),
		ExpiresAt:            openapi.FormatOptionalTime(data.ExpiresAt),
		Locations:            data.LocationStrings(),
		RequiresContract:     data.RequiresContract,
		HasDspt:              data.HasDspt,
		StoredOutsideUkEea:   data.StoredOutsideUkEea,
		Status:               openapi.AssetStatus(data.Status),
		CreatedAt:            openapi.FormatTime(data.CreatedAt),
		UpdatedAt:            openapi.FormatTime(data.UpdatedAt),
	}
	for _, contract := range data.Contracts {
		asset.ContractIds = append(asset.ContractIds, contract.ID.String())
	}
	for _, dataType := range data.DataTypes {
		asset.DataTypes = append(asset.DataTypes, openapi.AssetDataTypes(dataType.Name))
	}
	if data.LegalBasis != nil {
		asset.LegalBasis = new(openapi.AssetLegalBasis(*data.LegalBasis))
	}
	if data.LegalBasisSpecial != nil {
		asset.LegalBasisSpecial = new(openapi.AssetLegalBasisSpecial(*data.LegalBasisSpecial))
	}
	return asset
}
