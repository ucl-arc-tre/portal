import { storageLocationDefinitions } from "@/components/shared/storageDefinitions";
import { Asset } from "@/openapi";

export type RiskLevel = {
  classification: RiskClassification | undefined;
  score: number | undefined;
};
type RiskClassification = "manageable" | "uncomfortable" | "vulnerable" | "critical";

const maxLikelihoodScore = 4; // to align with IG likelihood scale
const maxAssetLikelihoodScore = Math.max(...storageLocationDefinitions.map((def) => def.likelihoodScore));

const maxAssetImpactScore = 6;
const maxImpactScore = 4;

export const riskScoreMax = maxImpactScore * maxLikelihoodScore;

const calculateAssetLikelihoodScore = (asset: Asset) => {
  let likelihoodScore = 0;
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

  // Likelihoods are relative, so normalise to make sure it's at most maxLikelihoodScore
  return (Math.min(likelihoodScore, maxAssetLikelihoodScore) * maxLikelihoodScore) / maxAssetLikelihoodScore;
};

export const calculateAssetRiskScore = (asset: Asset) => {
  let impactScore = 0;

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

  impactScore *= maxImpactScore / maxAssetImpactScore; // normalise
  const likelihoodScore = calculateAssetLikelihoodScore(asset);
  const assetScore = likelihoodScore * impactScore;

  return Math.round(assetScore);
};

const calculateHighestAssetRiskScore = (assets: Asset[]) => {
  if (assets.length === 0) return undefined;
  let highestAssetScore = 0;

  for (const asset of assets) {
    const assetScore = calculateAssetRiskScore(asset);
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
