import { ProjectTreRoleName } from "@/openapi";

export type Role = {
  label: string;
  description: string;
};

export const roles: Record<ProjectTreRoleName, Role> = {
  desktop_user: {
    label: "Desktop User",
    description: "Can access the desktop environment and work with data within the TRE",
  },
  ingresser: {
    label: "Ingresser",
    description: "Can upload data into the TRE environment",
  },
  egresser: {
    label: "Egresser",
    description: "Can download data from the TRE environment after approval",
  },
  egress_requester: {
    label: "Egress Requester",
    description: "Can request data to be downloaded from the TRE",
  },
  egress_checker: {
    label: "Egress Checker",
    description: "Can review and approve egress requests from other users",
  },
  trusted_egresser: {
    label: "Trusted Egresser",
    description: "Can download data from the TRE environment to a trusted destination",
  },
  API_user: {
    label: "API User",
    description: "Can use the TRE API to programmatically upload data into the TRE environment",
  },
};

// Returns a human-readable label for a TRE project role, falling back to a
// de-underscored version of the raw role name for unknown roles.
export function roleLabel(role: string): string {
  return roles[role as ProjectTreRoleName]?.label ?? role.replace(/_/g, " ");
}
