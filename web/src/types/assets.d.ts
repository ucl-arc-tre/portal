type AssetClassificationImpact = "public" | "confidential" | "highly_confidential";

type AssetProtection = "anonymisation" | "pseudonymisation" | "identifiable_low_confidence_pseudonymisation";
type AssetLegalBasis =
  | "consent"
  | "public_task"
  | "contract"
  | "legal_obligation"
  | "vital_interests"
  | "legitimate_interests";

type AssetFormat = "electronic" | "paper" | "other";

type AssetStatus = "active" | "awaiting" | "destroyed";

type AssetFormData = {
  title: string;
  description: string;
  classification_impact: AssetClassificationImpact | "";
  tier: number | string; // Can be string from form, converted to number
  protection: AssetProtection | "";
  legal_basis: AssetLegalBasis | "";
  format: AssetFormat | "";
  expires_at: string;
  locations: string[];
  requires_contract: boolean | string; // Can be string from form, converted to boolean
  has_dspt: boolean | string; // Can be string from form, converted to boolean
  stored_outside_uk_eea: boolean | string; // Can be string from form, converted to boolean
  status: AssetStatus | "";
  contracts: { value: string }[];
};
