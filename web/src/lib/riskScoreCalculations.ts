import { storageLocationDefinitions } from "@/components/shared/storageDefinitions";
import { Asset } from "@/openapi";

export type RiskLevel = {
  classification: RiskClassification | undefined;
  score: number | undefined;
};
type RiskClassification = "manageable" | "uncomfortable" | "vulnerable" | "critical";

export const riskScoreMax = 16;

export const calculateRiskScorePerAsset = (asset: Asset) => {
  let likelihoodScore = 0;
  let impactScore = 0;
  const maxLikelihoodScore = 6; // to align with IG likelihood scale

  asset.locations.forEach((assetLocation) => {
    const location = storageLocationDefinitions.find((def) => def.value === assetLocation);
    if (!location) return;
    if (location.likelihoodScore > likelihoodScore) {
      likelihoodScore = location.likelihoodScore;
    }
  });

  if (asset.stored_outside_uk_eea === true) {
    likelihoodScore += 1;
  }

  switch (asset.classification_impact) {
    case "public":
      impactScore += 0;
      break;
    case "confidential":
    case "highly_confidential":
      impactScore += 1;
      break;
    default:
      break;
  }
  switch (asset.protection) {
    case "anonymisation":
      impactScore += 0;
      break;
    case "pseudonymisation":
      impactScore += 1;
      break;
    case "identifiable_low_confidence_pseudonymisation":
      impactScore += 2;
      break;
    default:
      break;
  }

  if (asset.is_leak_major_disruption) {
    impactScore += 1;
  }
  if (asset.is_leak_major_financial_loss) {
    impactScore += 1;
  }
  if (asset.is_leak_major_reputational_damage) {
    impactScore += 1;
  }

  likelihoodScore = Math.min(likelihoodScore, maxLikelihoodScore);

  const assetScore = likelihoodScore * impactScore;

  return assetScore;
};

const calculateHighestAssetRiskScore = (assets: Asset[]) => {
  if (assets === undefined || assets.length === 0) return undefined;
  let highestAssetScore = 0;

  for (const asset of assets) {
    const assetScore = calculateRiskScorePerAsset(asset);
    if (assetScore > highestAssetScore) {
      highestAssetScore = assetScore;
    }
  }

  return highestAssetScore;
};
export const getRiskClassification = (score: number | undefined): RiskClassification | undefined => {
  if (score === undefined) return undefined;
  if (score < 3) {
    return "manageable";
  } else if (score >= 3 && score < 5) {
    return "uncomfortable";
  } else if (score >= 5 && score < 12) {
    return "vulnerable";
  } else if (score >= 12) {
    return "critical";
  }
  return undefined;
};

export const getStudyRiskLevel = (assets: Asset[] | undefined) => {
  if (assets === undefined || assets.length === 0) return undefined;
  const score = calculateHighestAssetRiskScore(assets);
  const classification = getRiskClassification(score);
  return { classification, score };
};
