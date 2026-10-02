package web

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ucl-arc-tre/portal/internal/config"
	"github.com/ucl-arc-tre/portal/internal/middleware"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/rbac"
	"github.com/ucl-arc-tre/portal/internal/service/studies"
	"github.com/ucl-arc-tre/portal/internal/types"
)

func assetQueryParams(params openapi.GetAssetsParams) (studies.AssetQueryParams, error) {
	if params.Limit != nil && *params.Limit > config.MaxPageSize {
		return studies.AssetQueryParams{}, types.NewErrClientInvalidObjectF("maxItems cannot be greater than %d", config.MaxPageSize)
	}
	if params.Limit != nil && *params.Limit <= 0 {
		return studies.AssetQueryParams{}, types.NewErrClientInvalidObject("maxItems must be greater than 0")
	}
	if params.Offset != nil && *params.Offset < 0 {
		return studies.AssetQueryParams{}, types.NewErrClientInvalidObject("startIndex cannot be negative")
	}
	queryParams := studies.AssetQueryParams{
		FuzzyTitle: params.Query,
		Limit:      config.DefaultPageSize,
		Offset:     0,
	}
	if params.Limit != nil {
		queryParams.Limit = *params.Limit
	}
	if params.Offset != nil {
		queryParams.Offset = *params.Offset
	}
	return queryParams, nil
}

func (h *Handler) GetAssets(ctx *gin.Context, params openapi.GetAssetsParams) {
	user := middleware.GetUser(ctx)

	canSeeAllAssets, err := rbac.HasAnyListedRole(user, rbac.Admin, rbac.IGOpsStaff, rbac.IGAdmin, rbac.TreOpsStaff, rbac.DSHOpsStaff)
	if err != nil {
		setError(ctx, err, "Failed to check user roles")
		return
	}

	queryParams, err := assetQueryParams(params)
	if err != nil {
		setError(ctx, err, "Failed to get assets")
		return
	}

	var assets []types.Asset
	if canSeeAllAssets {
		assets, err = h.studies.AllAssets(queryParams)
	} else {
		var studyIds []uuid.UUID
		studyIds, err = rbac.StudyIDsWithRole(user, rbac.StudyOwner)
		if err != nil {
			setError(ctx, err, "Failed to get accessible studies")
			return
		}
		assets, err = h.studies.AssetsByStudyIdsFiltered(queryParams, studyIds...)
	}
	if err != nil {
		setError(ctx, err, "Failed to get assets")
		return
	}

	response := []openapi.Asset{}
	for _, asset := range assets {
		response = append(response, assetToOpenApiAsset(asset))
	}

	ctx.JSON(http.StatusOK, response)
}

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
		Id:                            data.ID.String(),
		CreatorUserId:                 data.CreatorUserID.String(),
		StudyId:                       data.StudyID.String(),
		Title:                         data.Title,
		Source:                        data.Source,
		Description:                   data.Description,
		ClassificationImpact:          openapi.AssetClassificationImpact(data.ClassificationImpact),
		Tier:                          data.Tier,
		Format:                        openapi.AssetFormat(data.Format),
		ExpiresAt:                     openapi.FormatOptionalTime(data.ExpiresAt),
		Locations:                     data.LocationStrings(),
		RequiresContract:              data.RequiresContract,
		HasDspt:                       data.HasDspt,
		StoredOutsideUkEea:            data.StoredOutsideUkEea,
		Status:                        openapi.AssetStatus(data.Status),
		CreatedAt:                     openapi.FormatTime(data.CreatedAt),
		UpdatedAt:                     openapi.FormatTime(data.UpdatedAt),
		ContractIds:                   []string{},
		DataTypes:                     []openapi.AssetDataTypes{},
		IsLeakMajorDisruption:         data.IsLeakMajorDisruption,
		IsLeakMajorFinancialLoss:      data.IsLeakMajorFinancialLoss,
		IsLeakMajorReputationalDamage: data.IsLeakMajorReputationalDamage,
		RequiresTre:                   data.RequiresTre,
		HasTargetedThreatActors:       data.HasTargetedThreatActors,
		Protection:                    optionalStr[string, openapi.AssetProtection](data.Protection),
		LegalBasis:                    optionalStr[string, openapi.AssetLegalBasis](data.LegalBasis),
		LegalBasisSpecial:             optionalStr[string, openapi.AssetLegalBasisSpecial](data.LegalBasisSpecial),
	}
	for _, contract := range data.Contracts {
		asset.ContractIds = append(asset.ContractIds, contract.ID.String())
	}
	for _, dataType := range data.DataTypes {
		asset.DataTypes = append(asset.DataTypes, openapi.AssetDataTypes(dataType.Name))
	}
	return asset
}

func optionalStr[A ~string, B ~string](a *A) *B {
	if a == nil {
		return nil
	}
	return new(B(*a))
}
