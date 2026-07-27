import { useState } from "react";
import router from "next/router";
import { useAuth } from "@/hooks/useAuth";
import {
  postProjectsTreAdminByProjectIdApprove,
  patchProjectsTreByProjectIdPending,
  Study,
  deleteProjectsTreByProjectId,
  ProjectTre,
} from "@/openapi";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";

import Title from "@/components/ui/Title";
import LoginFallback from "@/components/ui/LoginFallback";
import Loading from "@/components/ui/Loading";
import Button from "@/components/ui/Button";
import ProjectForm from "@/components/projects/ProjectForm";
import styles from "./ManageProjectTRE.module.css";
import Box from "@/components/ui/Box";
import Error from "@/components/ui/Error";
import Dialog from "@/components/ui/Dialog";
import { defaultDesktopInstance, hpcDesktopInstances } from "@/components/projects/tre/desktops";
import AssetCard from "@/components/assets/AssetCard";
import ProjectTabs from "@/components/projects/ProjectTabs";
import DetailsField from "@/components/ui/DetailsField";
import ProjectMember from "../ProjectMember";

type Props = {
  project: ProjectTre;
  fetchData: () => void;
};

export default function ManageProjectTRE(props: Props) {
  const { project, fetchData } = props;

  const { authInProgress, isAuthed, userData, isAdmin, isTreOpsStaff } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const editingEnabled = project.status === "incomplete" || project.status === "deployed";
  const projectId = project.id;
  const canApprove = isAdmin || isTreOpsStaff;
  const canEdit =
    project?.creator_username == userData?.username ||
    (userData?.roles as string[]).includes(`project_${project.id}_owner`);

  // prepare the approved study for edit form
  const approvedStudy = project ? [{ id: project.study_id, title: project.study_title } as Study] : [];

  const handleSubmit = async () => {
    if (!projectId || typeof projectId !== "string") return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await patchProjectsTreByProjectIdPending({
        path: { projectId },
      });

      if (responseIsError(response)) {
        const errorMsg = extractErrorMessage(response);
        setError(`Failed to submit project: ${errorMsg}`);
        return;
      }
      fetchData();
    } catch (err) {
      console.error("Failed to submit project:", err);
      setError("Failed to submit project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (!projectId || typeof projectId !== "string") return;

    setIsApproving(true);
    setError(null);

    try {
      const response = await postProjectsTreAdminByProjectIdApprove({
        path: { projectId },
      });

      if (responseIsError(response)) {
        const errorMsg = extractErrorMessage(response);
        setError(`Failed to approve project: ${errorMsg}`);
        return;
      }
      fetchData();
    } catch (err) {
      console.error("Failed to approve project:", err);
      setError("Failed to approve project. Please try again.");
    } finally {
      setIsApproving(false);
    }
  };

  const handleProjectCreated = () => {
    setShowEditForm(false);
    if (projectId) {
      fetchData();
    }
  };

  const handleCancelCreate = () => {
    setShowEditForm(false);
  };

  const handleConfirmDelete = async () => {
    if (!projectId) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      const response = await deleteProjectsTreByProjectId({
        path: { projectId: projectId as string },
      });

      if (responseIsError(response)) {
        const errorMsg = extractErrorMessage(response);
        setDeleteError(`Failed to delete project: ${errorMsg}`);
        return;
      }

      setShowDeleteConfirm(false);
      router.push("/projects");
    } catch (error) {
      console.error("Failed to delete project:", error);
      setDeleteError("Failed to delete project. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteError(null);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
    setDeleteError(null);
  };

  const tab = (router.query.tab as "project" | "members" | "assets") ?? "project";

  if (authInProgress) return <Loading />;
  if (!isAuthed) return <LoginFallback />;

  if (error) {
    return (
      <div>
        <Title text="Error" />
        <Error message={error} />
        <Button onClick={() => router.push("/projects")} variant="secondary">
          Back to Projects
        </Button>
      </div>
    );
  }

  if (!project) {
    return (
      <div>
        <Title text="Not Found" />
        <Error message="Project not found." />
        <Button onClick={() => router.push("/projects")} variant="secondary">
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <>
      {!canApprove && project.status === "incomplete" && (
        <div className={styles["approval-section"]}>
          <p className={styles["approval-info"]}>
            Please review your project details below. Once you are satisfied with the information provided, submit your
            project and an administrator will review it.
          </p>
          <div className={styles["approval-actions"]}>
            {canEdit && (
              <Button onClick={() => setShowEditForm(true)} size="small" variant="secondary" disabled={!editingEnabled}>
                Edit
              </Button>
            )}
            {canEdit && (
              <Button onClick={handleDeleteClick} size="small" disabled={deleting} variant="secondary-destructive">
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            )}

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              size="small"
              cy="mark-project-ready-for-review-button"
            >
              {isSubmitting ? "Submitting..." : "Mark Ready for Review"}
            </Button>
          </div>
        </div>
      )}

      {canApprove && project.status === "pending-approval" && (
        <div className={styles["approval-section"]}>
          <p className={styles["approval-info"]}>
            Please review the below project details, members, and assets before approving this project.
          </p>
          <div className={styles["approval-actions"]}>
            <Button onClick={handleApprove} disabled={isApproving} size="large" cy="accept-project-button">
              {isApproving ? "Approving..." : "Accept Project"}
            </Button>
          </div>
        </div>
      )}

      <div className={styles.header}>
        <h2>{project.name}</h2>
        {canEdit && project.status !== "incomplete" && (
          <div>
            <Button onClick={() => setShowEditForm(true)} size="medium" variant="secondary" disabled={!editingEnabled}>
              Edit Project
            </Button>
          </div>
        )}
      </div>

      <ProjectTabs />

      {tab === "project" && (
        <Box>
          <DetailsField label="Environment" value={project.environment_name} />
          <DetailsField
            label="Status"
            value={`${project.status}${project.is_pending_deployment_update ? " pending update" : ""}`}
          />
          <DetailsField label="Created by" value={project.creator_username} />
          <DetailsField label="Created" value={new Date(project.created_at).toLocaleDateString()} />
          <DetailsField label="Study" value={project.study_title} />
          <DetailsField
            label="Number of approvals required for egress"
            value={`${project.num_required_egress_approvals}`}
          />
          <DetailsField
            label="External encryption enabled"
            value={project.external_encryption_enabled ? "Yes" : "No"}
          />
          <DetailsField label="Airlock whitelist">
            {project.airlock_whitelist && project.airlock_whitelist.length > 0 ? (
              <ul className={styles["field-list"]}>
                {project.airlock_whitelist.map((entry, index) => (
                  <li key={index} className={styles["field-item"]}>
                    {entry}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles["empty-message"]}>No IPs or FQDNs have been whitelisted for this project.</p>
            )}
          </DetailsField>
          <DetailsField label="Number of members" value={project.members ? project.members.length : 0} />
          <DetailsField label="Number of Assets" value={project.assets ? project.assets.length : 0} />
        </Box>
      )}

      {tab === "members" && (
        <Box>
          <div>
            {project.members && project.members.length > 0 ? (
              <ul className={styles["field-list"]}>
                {project.members.map((member, index) => (
                  <ProjectMember member={member} key={index}>
                    {member.desktop_config && (
                      <div className={styles["desktop-configuration"]}>
                        <strong>Desktop configuration:</strong>
                        <p>
                          {hpcDesktopInstances.find(
                            (instance) => instance.aws_value == member.desktop_config?.hpc_instance_type
                          )?.label || defaultDesktopInstance.label + " (default)"}
                        </p>
                      </div>
                    )}
                  </ProjectMember>
                ))}
              </ul>
            ) : (
              <p className={styles["empty-message"]}>No members have been added to this project yet.</p>
            )}
          </div>
        </Box>
      )}
      {tab === "assets" && (
        <Box>
          {project.assets && project.assets.length > 0 ? (
            <div className={styles["assets-grid"]}>
              {project.assets?.map((asset) => (
                <AssetCard key={asset.id} studyId={project.study_id} asset={asset} showRiskScore={false} />
              ))}
            </div>
          ) : (
            <p className={styles["empty-message"]}>No assets have been added to this project yet.</p>
          )}
        </Box>
      )}

      {showEditForm && project && (
        <ProjectForm
          approvedStudies={approvedStudy}
          editingProject={project}
          handleProjectCreated={() => handleProjectCreated()}
          handleCancelCreate={() => handleCancelCreate()}
        />
      )}

      {showDeleteConfirm && (
        <Dialog setDialogOpen={handleCancelDelete}>
          <div className={styles["delete-dialog"]}>
            <h2>Delete Project</h2>
            <p>
              Are you sure you want to delete project <strong>{project.name}</strong>?
            </p>
            <p>This action will delete the project and remove the links to its associated data including:</p>
            <ul>
              <li>Project members and their roles</li>
              <li>Linked assets</li>
              <li>Project configuration</li>
            </ul>

            {deleteError && <Error message={deleteError} />}

            <div className={styles["delete-actions"]}>
              <Button onClick={handleCancelDelete} variant="secondary" disabled={!!deleting}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                variant="primary-destructive"
                disabled={!!deleting}
                className={styles["delete-button-confirm"]}
              >
                {deleting ? "Deleting..." : "Delete Project"}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}
