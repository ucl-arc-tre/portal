package web

import (
	"github.com/ucl-arc-tre/portal/internal/config"
	openapi "github.com/ucl-arc-tre/portal/internal/openapi/web"
	"github.com/ucl-arc-tre/portal/internal/types"
)

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
