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

func assetToOpenApiAsset(asset types.Asset) openapi.Asset {
	contractIds := []string{}
	for _, contract := range asset.Contracts {
		contractIds = append(contractIds, contract.ID.String())
	}
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
		ExpiresAt:            openapi.FormatOptionalTime(asset.ExpiresAt),
		Locations:            asset.LocationStrings(),
		RequiresContract:     asset.RequiresContract,
		HasDspt:              asset.HasDspt,
		StoredOutsideUkEea:   asset.StoredOutsideUkEea,
		Status:               openapi.AssetStatus(asset.Status),
		CreatedAt:            openapi.FormatTime(asset.CreatedAt),
		UpdatedAt:            openapi.FormatTime(asset.UpdatedAt),
		ContractIds:          contractIds,
	}
}
