import { Project } from "@/openapi";
import StatusBadge from "../ui/StatusBadge";

import styles from "./ProjectCardsList.module.css";
import Card from "../ui/Card";

type Props = {
  projects: Project[];
  isOpsStaff: boolean;
};

export default function ProjectCardsList(props: Props) {
  const { projects, isOpsStaff = false } = props;

  return (
    <div className={styles["project-selection"]}>
      <h2 className={styles["projects-heading"]}>{isOpsStaff ? "All Projects pending review" : "Your Projects"}</h2>

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
