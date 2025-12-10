import { useRouter } from "next/router";
import { ApprovalStatus, Project } from "@/openapi";
import Button from "@/components/ui/Button";
import StatusBadge from "../ui/StatusBadge";

import styles from "./ProjectCardsList.module.css";

type Props = {
  projects: Project[];
};

const projectSortOrder: Record<ApprovalStatus, number> = {
  Pending: 1,
  Incomplete: 2,
  Rejected: 3,
  Approved: 4,
};

export default function ProjectCardsList(props: Props) {
  const { projects } = props;
  const router = useRouter();

  return (
    <div className={styles["project-selection"]}>
      <h2 className={styles["projects-heading"]}>Your Projects</h2>

      <div className={styles["projects-list"]}>
        {projects
          .sort((a, b) => projectSortOrder[a.approval_status] - projectSortOrder[b.approval_status])
          .map((project) => (
            <div key={project.id} className={styles["project-card"]}>
              <div className={styles["status-indicator"]}>
                <StatusBadge status={project.approval_status} isAdmin={false} />
              </div>

              <div className={styles["project-info"]}>
                <h3 className={styles["project-title"]}>{project.name}</h3>
                <p className={styles["project-environment"]}>Environment: {project.environment_name}</p>
                <p className={styles["project-creator"]}>Created by: {project.creator_username}</p>
              </div>

              <div className={styles["project-actions"]}>
                <Button
                  onClick={() =>
                    router.push(`/projects/manage?projectId=${project.id}&environment=${project.environment_name}`)
                  }
                  size="small"
                >
                  Manage Project
                </Button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
