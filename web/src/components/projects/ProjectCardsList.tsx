import { Project } from "@/openapi";
import StatusBadge from "../ui/StatusBadge";

import styles from "./ProjectCardsList.module.css";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import TextLink from "../ui/TextLink";
import { HelperText } from "../shared/uikitExports";
import { projectAccessReviewWarningRequired } from "../shared/exports";

type Props = {
  projects: Project[];
};

export default function ProjectCardsList(props: Props) {
  const { projects } = props;

  if (projects.length === 0) {
    return (
      <HelperText>
        No projects have been created for this study yet. Visit the{" "}
        <TextLink href="/projects" cy="empty-projects-link">
          Projects
        </TextLink>{" "}
        page to create one.
      </HelperText>
    );
  }

  return (
    <div className={styles["project-selection"]}>
      <div className={styles["projects-list"]}>
        {projects
          .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at))
          .map((project) => (
            <Card
              key={project.id}
              title={project.name}
              manageUrl={`/projects/manage?projectId=${project.id}&environment=${project.environment_name}`}
              headerContent={
                <div className={styles["status-indicator"]}>
                  <StatusBadge status={project.status} type="project" environment={project.environment_name} />
                  {project.status === "deployed" &&
                    project.last_access_review != null &&
                    projectAccessReviewWarningRequired(project.last_access_review) && (
                      <Badge className={styles["access-review-warning-tag"]} cy="project-access-review-badge">
                        Access Review due
                      </Badge>
                    )}
                </div>
              }
            >
              <div className={styles["project-info"]}>
                <p className={styles["project-environment"]}>Environment: {project.environment_name}</p>
                <p className={styles["project-creator"]}>Created by: {project.creator_username}</p>
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
}
