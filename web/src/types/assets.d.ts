type AssetFormData = {
  title: string;
  description: string;
  classification_impact: string;
  tier: number | string; // Can be string from form, converted to number
  protection: string;
  legal_basis: string;
  format: string;
  has_expiry_date: boolean | string;
  expires_at: string | null;
  locations: string[];
  requires_contract: boolean | string; // Can be string from form, converted to boolean
  has_dspt: boolean | string; // Can be string from form, converted to boolean
  stored_outside_uk_eea: boolean | string; // Can be string from form, converted to boolean
  status: string;
};
