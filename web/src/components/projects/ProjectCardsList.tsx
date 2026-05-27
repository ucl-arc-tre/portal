import { useState } from "react";
import { ApprovalStatus, Project, deleteProjectsTreByProjectId } from "@/openapi";
import { useRouter } from "next/router";
import { Project, deleteProjectsTreByProjectId } from "@/openapi";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";
import Button from "@/components/ui/Button";
import StatusBadge from "../ui/StatusBadge";
import Dialog from "@/components/ui/Dialog";
import { Alert, AlertMessage } from "../shared/uikitExports";

import styles from "./ProjectCardsList.module.css";
import Card from "../ui/Card";

type Props = {
  projects: Project[];
  isOpsStaff: boolean;
  fetchData?: () => void;
};

export default function ProjectCardsList(props: Props) {
  const { projects, isOpsStaff = false, fetchData } = props;
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

      if (responseIsError(response)) {
        const errorMsg = extractErrorMessage(response);
        setDeleteError(`Failed to delete project: ${errorMsg}`);
        return;
      }

      setShowDeleteConfirm(false);
      setProjectToDelete(null);
      if (fetchData) {
        fetchData();
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
          .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at))
          .map((project) => (
            <Card
              key={project.id}
              title={project.name}
              manageUrl={`/projects/manage?projectId=${project.id}&environment=${project.environment_name}`}
              headerContent={<StatusBadge status={project.approval_status} type="project" />}
              actions={
              {isOpsStaff &&
                <Button
                  onClick={() =>
                    router.push(`/projects/manage?projectId=${project.id}&environment=${project.environment_name}`)
                  }
                  size="small"
                >
                  Manage Project Approval
                </Button>}
                {!isOpsStaff && project.status === "incomplete" && (
                  <Button
                    onClick={() => handleDeleteClick(project)}
                    size="small"
                    disabled={deletingProjectId === project.id}
                    variant="primary-destructive"
                  >
                    {deletingProjectId === project.id ? "Deleting..." : "Delete"}
                  </Button>
                )
              }
            >
              <div className={styles["project-info"]}>
                <p className={styles["project-environment"]}>Environment: {project.environment_name}</p>
                <p className={styles["project-creator"]}>Created by: {project.creator_username}</p>
              </div>
            </Card>
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
                variant="primary-destructive"
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
