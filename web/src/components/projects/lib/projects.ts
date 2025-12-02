import { ProjectTreRoleName } from "@/openapi";
import { ProjectNameValidation, AnyProjectRoleName } from "@/types/projects";

// Project name validation patterns per environment
// Note: These patterns are also validated on the backend in internal/validation/patterns.go
const TRE_PROJECT_NAME_PATTERN = /^[0-9a-z]{4,14}$/;
const TRE_PROJECT_NAME_MIN_LENGTH = 4;
const TRE_PROJECT_NAME_MAX_LENGTH = 14;

export const getProjectNameValidation = (environmentName: string): ProjectNameValidation => {
  if (environmentName === "ARC Trusted Research Environment") {
    return {
      pattern: TRE_PROJECT_NAME_PATTERN,
      minLength: TRE_PROJECT_NAME_MIN_LENGTH,
      maxLength: TRE_PROJECT_NAME_MAX_LENGTH,
      patternMessage: "Must be 4-14 characters long and contain only lowercase letters and numbers",
      helperText: "Use lowercase letters and numbers only (4-14 characters)",
    };
  }
  throw new Error(`Unsupported environment: ${environmentName}`);
};

// Role definitions per environment
const TRE_ROLES: ProjectTreRoleName[] = [
  "desktop_user",
  "ingresser",
  "egresser",
  "egress_requester",
  "egress_checker",
  "trusted_egresser",
];

const TRE_ROLE_LABELS: Record<ProjectTreRoleName, string> = {
  desktop_user: "Desktop User",
  ingresser: "Ingresser",
  egresser: "Egresser",
  egress_requester: "Egress Requester",
  egress_checker: "Egress Checker",
  trusted_egresser: "Trusted Egresser",
};

const TRE_ROLE_DESCRIPTIONS: Record<ProjectTreRoleName, string> = {
  desktop_user: "Can access the desktop environment and work with data within the TRE",
  ingresser: "Can upload data into the TRE environment",
  egresser: "Can download data from the TRE environment after approval",
  egress_requester: "Can request data to be downloaded from the TRE",
  egress_checker: "Can review and approve egress requests from other users",
  trusted_egresser: "Can download data from the TRE environment without requiring approval",
};

export const ROLE_LABELS: Record<AnyProjectRoleName, string> = {
  // add more roles as they become available e.g. ...DSH_ROLE_LABELS,
  ...TRE_ROLE_LABELS,
};

export const ROLE_DESCRIPTIONS: Record<AnyProjectRoleName, string> = {
  // add more roles as they become available e.g. ...DSH_ROLE_DESCRIPTIONS,
  ...TRE_ROLE_DESCRIPTIONS,
};

export const getAvailableRoles = (environmentName: string): AnyProjectRoleName[] => {
  // add more environments as they become available e.g. if (environmentName === "Data Safe Haven") return DSH_ROLES;
  if (environmentName === "ARC Trusted Research Environment") return TRE_ROLES;
  return [];
};
