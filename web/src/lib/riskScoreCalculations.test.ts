import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateAssetRiskScore, getRiskLevel, getStudyRiskInfo } from "./riskScoreCalculations";
import type { Asset } from "@/openapi";

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

describe("getRiskLevel", () => {
  it("classifies a score of 0 as manageable", () => {
    assert.strictEqual(getRiskLevel(0), "manageable");
  });

  it("does not classify a score of 2 as uncomfortable", () => {
    assert.notStrictEqual(getRiskLevel(2), "uncomfortable");
  });

  it("classifies a score of 3 as uncomfortable", () => {
    assert.strictEqual(getRiskLevel(3), "uncomfortable");
  });

  it("classifies a score of 5 as vulnerable", () => {
    assert.strictEqual(getRiskLevel(5), "vulnerable");
  });

  it("classifies a score of 12 as critical", () => {
    assert.strictEqual(getRiskLevel(12), "critical");
  });
});

describe("getStudyRiskInfo", () => {
  it("returns undefined when there are no assets", () => {
    assert.strictEqual(getStudyRiskInfo([]), undefined);
    assert.strictEqual(getStudyRiskInfo(undefined), undefined);
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

    const result = getStudyRiskInfo([lowRiskAsset, highRiskAsset]);

    assert.strictEqual(result?.score, calculateAssetRiskScore(highRiskAsset));
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

    assert.strictEqual(calculateAssetRiskScore(asset), 4);
  });
});
