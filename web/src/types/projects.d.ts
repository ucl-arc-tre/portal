import { ProjectTre, ProjectTreMember, ProjectTreRoleName, ProjectDshMember, ProjectDshRoleName } from "@/openapi";

// Union type for all project types across environments
// e.g. export type AnyProject = ProjectTre | ProjectDsh;
export type AnyProject = ProjectTre;

// Union type for project members across environments
export type AnyProjectMember = ProjectTreMember | ProjectDshMember;

// Union type for project role names across environments
export type AnyProjectRoleName = ProjectTreRoleName | ProjectDshRoleName;
