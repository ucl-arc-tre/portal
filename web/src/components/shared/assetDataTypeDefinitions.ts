export type AssetDataTypeDefinition = {
  name: string;
  value: string;
  definition?: string | undefined;
};

export const assetDataTypeDefinitions: AssetDataTypeDefinition[] = [
  {
    name: "Personal data",
    value: "personal",
    definition: "Data relating to a person.",
  },
  {
    name: "Special category personal data",
    value: "special_category_personal",
    // See: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/special-category-data/what-is-special-category-data/
    definition:
      "Special category data concerning (a) persons: racial or ethnic origin, political opinions, religious or philosophical beliefs, trade union membership, genetic, biometric, health, sex life or sexual orientation.",
  },
  {
    name: "Commercially confidential information",
    value: "commercially_confidential",
  },
  {
    name: "Research data",
    value: "research",
  },
  {
    name: "Administrative or operational information",
    value: "administrative_operations",
  },
  {
    name: "Financial information",
    value: "financial",
  },
  {
    name: "Audio recordings",
    value: "audio",
  },
  {
    name: "Video recordings",
    value: "video",
  },
  {
    name: "Images or photographs",
    value: "images",
  },
  {
    name: "Software, code, models, or algorithms",
    value: "software",
  },
  {
    name: "Documentation, protocols, or study materials",
    value: "documentation",
  },
  {
    name: "Research outputs, reports, or publications",
    value: "research_output",
  },
  {
    name: "Other (please include in description)",
    value: "other",
  },
];
