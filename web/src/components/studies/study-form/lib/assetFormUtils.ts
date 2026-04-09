import { Asset } from "@/openapi";

export const populateExistingAssetFormData = (asset: Asset): AssetFormData => {
  return {
    title: asset.title,
    description: asset.description?.trim(),
    classification_impact: asset.classification_impact,
    tier: asset.tier,
    protection: asset.protection,
    legal_basis: asset.legal_basis,
    format: asset.format,
    expires_at: asset.expires_at ? asset.expires_at.split("T")[0] : "",
    locations: asset.locations,
    requires_contract: asset.requires_contract,
    has_dspt: asset.has_dspt,
    stored_outside_uk_eea: asset.stored_outside_uk_eea,
    status: asset.status,
  };
};
