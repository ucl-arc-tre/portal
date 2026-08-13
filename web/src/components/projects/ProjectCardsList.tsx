import Link from "next/link";
import { Project } from "@/openapi";
import StatusBadge from "../ui/StatusBadge";

import styles from "./ProjectCardsList.module.css";
import Card from "../ui/Card";
import { HelperText } from "../shared/uikitExports";

type Props = {
  projects: Project[];
};

export default function ProjectCardsList(props: Props) {
  const { projects } = props;

  if (projects.length === 0) {
    return (
      <HelperText>
        No projects have been created for this study yet. Visit the{" "}
        <Link href="/projects" className={styles.link}>
          Projects
        </Link>{" "}
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
                <StatusBadge status={project.status} type="project" environment={project.environment_name} />
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
