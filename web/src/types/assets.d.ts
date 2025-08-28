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
  accessed_by_third_parties: boolean | string; // Can be string from form, converted to boolean
  third_party_agreement: string;
  status: string;
};
