import { ProjectNameValidation } from "@/types/projects";

// Note: These patterns are also validated on the backend in internal/validation/patterns.go
const VALIDATION_CONFIG: Record<string, ProjectNameValidation> = {
  "ARC Trusted Research Environment": {
    pattern: /^[0-9a-z]{4,14}$/,
    minLength: 4,
    maxLength: 14,
    patternMessage: "Must be 4-14 characters long and contain only lowercase letters and numbers",
    helperText: "Use lowercase letters and numbers only (4-14 characters)",
  },
};

export const getProjectNameValidation = (environmentName: string): ProjectNameValidation => {
  const config = VALIDATION_CONFIG[environmentName];
  if (!config) {
    throw new Error(`Unsupported environment: ${environmentName}`);
  }
  return config;
};
