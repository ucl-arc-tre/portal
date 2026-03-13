import { extractErrorMessage } from "@/lib/errorHandler";
import { Asset, getStudiesByStudyIdAssetsByAssetIdContracts } from "@/openapi";

// need to review if this function is implemented well
export const checkAssetManagementCompleted = async (assets: Asset[], studyId: string) => {
  const checkAssetForContracts = async (assetId: string): Promise<boolean> => {
    const response = await getStudiesByStudyIdAssetsByAssetIdContracts({
      path: { studyId, assetId },
    });

    if (!response.response.ok || !response.data) {
      const errorMsg = extractErrorMessage(response);
      throw new Error(`Failed to load contracts for asset: ${errorMsg}`);
    }
    return response.data.length > 0;
  };

  const assetsRequiringContracts = assets.filter((asset) => asset.requires_contract);
  const requiredContractChecks = assetsRequiringContracts.map((asset) => checkAssetForContracts(asset.id));
  const results = await Promise.all(requiredContractChecks);
  return results.every(Boolean);
};
