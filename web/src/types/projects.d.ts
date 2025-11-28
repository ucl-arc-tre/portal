import { ProjectTre, ProjectTreMember, ProjectTreRoleName } from "@/openapi";

// Union type for all project types across environments
// e.g. export type AnyProject = ProjectTre | ProjectDsh;
type AnyProject = ProjectTre;

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
