import { useState } from "react";
import { useRouter } from "next/router";
import { ApprovalStatus, Project, deleteProjectsTreByProjectId } from "@/openapi";
import Button from "@/components/ui/Button";
import StatusBadge from "../ui/StatusBadge";
import Dialog from "@/components/ui/Dialog";
import { Alert, AlertMessage } from "../shared/exports";

import styles from "./ProjectCardsList.module.css";

type Props = {
  projects: Project[];
  isOpsStaff: boolean;
  fetchData?: () => void;
};

const projectSortOrder: Record<ApprovalStatus, number> = {
  Pending: 1,
  Incomplete: 2,
  Rejected: 3,
  Approved: 4,
};

export default function ProjectCardsList(props: Props) {
  const { projects, isOpsStaff = false, fetchData } = props;
  const router = useRouter();
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setShowDeleteConfirm(true);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;

    setDeletingProjectId(projectToDelete.id);
    setDeleteError(null);

    try {
      const response = await deleteProjectsTreByProjectId({
        path: { projectId: projectToDelete.id },
      });

      if (response.response.ok) {
        setShowDeleteConfirm(false);
        setProjectToDelete(null);
        if (fetchData) {
          fetchData();
        }
      } else {
        throw new Error(`Failed to delete project: ${response.response.status} ${response.response.statusText}`);
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
      setDeleteError("Failed to delete project. Please try again.");
    } finally {
      setDeletingProjectId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setProjectToDelete(null);
    setDeleteError(null);
  };

  return (
    <div className={styles["project-selection"]}>
      <h2 className={styles["projects-heading"]}>{isOpsStaff ? "All Projects pending review" : "Your Projects"}</h2>

      <div className={styles["projects-list"]}>
        {projects
          .sort((a, b) => projectSortOrder[a.approval_status] - projectSortOrder[b.approval_status])
          .map((project) => (
            <div key={project.id} className={styles["project-card"]}>
              <div className={styles["status-indicator"]}>
                <StatusBadge status={project.approval_status} isOpsStaff={isOpsStaff} type="project" />
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
                  {`Manage Project ${isOpsStaff ? "Approval" : ""}`}
                </Button>
                {!isOpsStaff && (
                  <Button
                    onClick={() => handleDeleteClick(project)}
                    size="small"
                    variant="secondary"
                    disabled={deletingProjectId === project.id}
                    className="delete-button"
                  >
                    {deletingProjectId === project.id ? "Deleting..." : "Delete"}
                  </Button>
                )}
              </div>
            </div>
          ))}
      </div>

      {showDeleteConfirm && projectToDelete && (
        <Dialog setDialogOpen={handleCancelDelete}>
          <div className={styles["delete-dialog"]}>
            <h2>Delete Project</h2>
            <p>
              Are you sure you want to delete project <strong>{projectToDelete.name}</strong>?
            </p>
            <p>This action will delete the project and remove the links to its associated data including:</p>
            <ul>
              <li>Project members and their roles</li>
              <li>Linked assets</li>
              <li>Project configuration</li>
            </ul>

            {deleteError && (
              <Alert type="error">
                <AlertMessage>{deleteError}</AlertMessage>
              </Alert>
            )}

            <div className={styles["delete-actions"]}>
              <Button onClick={handleCancelDelete} variant="secondary" disabled={!!deletingProjectId}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                variant="primary"
                disabled={!!deletingProjectId}
                className={styles["delete-button-confirm"]}
              >
                {deletingProjectId ? "Deleting..." : "Delete Project"}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
