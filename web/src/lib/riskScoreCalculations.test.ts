import { describe, expect, it } from "vitest";
import { calculateAssetRiskScore, getRiskClassification, getStudyRiskLevel } from "./riskScoreCalculations";
import { Asset } from "@/openapi";

function makeAsset(overrides: Partial<Asset> = {}): Asset {
  return {
    id: "asset-1",
    creator_user_id: "user-1",
    study_id: "study-1",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    contract_ids: [],
    title: "Test asset",
    description: "Test asset description",
    classification_impact: "public",
    tier: 0,
    locations: [],
    data_types: [],
    format: "electronic",
    requires_contract: false,
    has_dspt: false,
    stored_outside_uk_eea: false,
    status: "active",
    ...overrides,
  };
}

describe("getRiskClassification", () => {
  it("classifies a score of 0 as manageable", () => {
    expect(getRiskClassification(0)).toBe("manageable");
  });

  it("does not classify a score of 2 as uncomfortable", () => {
    expect(getRiskClassification(2)).not.toBe("uncomfortable");
  });

  it("classifies a score of 3 as uncomfortable", () => {
    expect(getRiskClassification(3)).toBe("uncomfortable");
  });

  it("classifies a score of 5 as vulnerable", () => {
    expect(getRiskClassification(5)).toBe("vulnerable");
  });

  it("classifies a score of 12 as critical", () => {
    expect(getRiskClassification(12)).toBe("critical");
  });
});

describe("getStudyRiskLevel", () => {
  it("returns undefined when there are no assets", () => {
    expect(getStudyRiskLevel([])).toBeUndefined();
    expect(getStudyRiskLevel(undefined)).toBeUndefined();
  });

  it("uses the highest-scoring asset to classify the study", () => {
    const lowRiskAsset = makeAsset({ classification_impact: "public" });
    const highRiskAsset = makeAsset({
      classification_impact: "highly_confidential",
      protection: "identifiable_low_confidence_pseudonymisation",
      is_leak_major_disruption: true,
      is_leak_major_financial_loss: true,
      is_leak_major_reputational_damage: true,
      locations: ["data_entry"],
    });

    const result = getStudyRiskLevel([lowRiskAsset, highRiskAsset]);

    expect(result?.score).toBe(calculateAssetRiskScore(highRiskAsset));
  });
});

describe("calculateAssetRiskScore", () => {
  it("scores a highly confidential, pseudonymised asset sent by email as 4", () => {
    const asset = makeAsset({
      classification_impact: "highly_confidential",
      protection: "pseudonymisation",
      is_leak_major_disruption: true,
      locations: ["email"],
    });

    expect(calculateAssetRiskScore(asset)).toBe(4);
  });
});
