type AssetFormData = {
  title: string;
  description: string;
  classification_impact: string;
  protection: string;
  legal_basis: string;
  format: string;
  expiry: string;
  locations: string[];
  has_dspt: boolean | string; // Can be string from form, converted to boolean
  stored_outside_uk_eea: boolean | string; // Can be string from form, converted to boolean
  status: string;
};
