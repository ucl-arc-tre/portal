type AssetDataType =
  | "personal"
  | "special_category_personal"
  | "commercially_confidential"
  | "research"
  | "administrative_operations"
  | "financial"
  | "audio"
  | "video"
  | "images"
  | "software"
  | "documentation"
  | "research_output"
  | "other";

type AssetProtectionType = "anonymisation" | "pseudonymisation" | "identifiable_low_confidence_pseudonymisation";

type AssetLegalSpecialType =
  | "archiving_research_statistical"
  | "consent"
  | "law"
  | "vital_interests"
  | "made_public"
  | "public_interest"
  | "health"
  | "public_health"
  | "legal"
  | undefined;

type AssetFormData = {
  title: string;
  description: string;
  source?: string | undefined;
  classification_impact: string;
  tier: number | string; // Can be string from form, converted to number
  protection: AssetProtectionType;
  legal_basis: string;
  legal_basis_special: AssetLegalSpecialType | undefined;
  format: string;
  has_expiry_date: boolean | string;
  expires_at: string | null;
  data_types: AssetDataType[];
  locations: string[];
  requires_contract: boolean | string; // Can be string from form, converted to boolean
  has_dspt: boolean | string; // Can be string from form, converted to boolean
  stored_outside_uk_eea: boolean | string; // Can be string from form, converted to boolean
  status: string;
  is_leak_major_financial_loss: boolean | string; // Can be string from form, converted to boolean
  is_leak_major_reputational_damage: boolean | string; // Can be string from form, converted to boolean
  is_leak_major_disruption: boolean | string; // Can be string from form, converted to boolean
  requires_tre: boolean | string; // Can be string from form, converted to boolean
  has_targeted_threat_actors: boolean | string; // Can be string from form, converted to boolean
};
