import { ProjectDsh, ProjectSensitiveRedCap, ProjectTre, ProjectTreMember, ProjectTreRoleName } from "@/openapi";

// Union type for all project types across environments
// e.g. export type AnyProject = ProjectTre | ProjectDsh | ProjectSensitiveRedCap;
type AnyProject = ProjectTre | ProjectDsh | ProjectSensitiveRedCap;

// Union type for project members across environments (add more as needed)
type AnyProjectMember = ProjectTreMember;

// Union type for project role names across environments (add more as needed)
type AnyProjectRoleName = ProjectTreRoleName;

type ProjectNameValidation = {
  pattern: RegExp;
  minLength: number;
  maxLength: number;
  patternMessage: string;
  helperText: string;
};

type ProjectFormDataTRE = {
  requestedStorageGb: number;
  numRequiredEgressApprovals: string;
  externalEncryptionEnabled: "false" | "true";
  airlockExternalDataEnabled?: "false" | "true";
  airlockSSHWhitelistEnabled?: "false" | "true";
  airlockOutboundWhitelist?: { value: string }[];
  airlockSSHWhitelist?: { value: string }[];
  requiresHPCDesktops: "false" | "true";
  userConfig?: { username: string; hpcInstance: string | undefined }[];
};

type ProjectFormData = {
  name: string;
  description: string;
  projectTreIds: string[];
  projectDshIds: string[];
  studyId: string;
  environmentId: string;
  assetIds: { value: string }[];
  members: { username: string; roles: AnyProjectRoleName[] }[];
  tre?: ProjectFormDataTRE;
};
