type AssetFormData = {
  title: string;
  description: string;
  classification_impact: string;
  protection: string;
  legal_basis: string;
  format: string;
  expires_at: string;
  locations: string[];
  requires_contract: boolean | string; // Can be string from form, converted to boolean
  has_dspt: boolean | string; // Can be string from form, converted to boolean
  stored_outside_uk_eea: boolean | string; // Can be string from form, converted to boolean
  status: string;
};
