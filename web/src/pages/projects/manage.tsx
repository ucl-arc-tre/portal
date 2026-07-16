import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { AnyProject } from "@/types/projects";
import {
  getProjectsTreByProjectId,
  postProjectsTreAdminByProjectIdApprove,
  patchProjectsTreByProjectIdPending,
  Study,
  deleteProjectsTreByProjectId,
} from "@/openapi";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";

import MetaHead from "@/components/meta/Head";
import Title from "@/components/ui/Title";
import LoginFallback from "@/components/ui/LoginFallback";
import Loading from "@/components/ui/Loading";
import Button from "@/components/ui/Button";
import ProjectForm from "@/components/projects/ProjectForm";
import { roleLabel } from "@/components/projects/tre/roles";

import styles from "./ManageProject.module.css";
import Box from "@/components/ui/Box";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Alert, AlertMessage } from "@/components/shared/uikitExports";
import Dialog from "@/components/ui/Dialog";

export default function ManageProjectPage() {
  const router = useRouter();
  const { projectId, environment } = router.query;
  const { authInProgress, isAuthed, userData } = useAuth();
  const [project, setProject] = useState<AnyProject | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingEnabled, setEditingEnabled] = useState(true);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isApprovedResearcher = userData?.roles.includes("approved-researcher");
  const isAdmin = userData?.roles.includes("admin");
  const isTreOpsStaff = userData?.roles.includes("tre-ops-staff");
  const canApprove = isAdmin || isTreOpsStaff;
  const canEdit =
    project?.creator_username == userData?.username ||
    (userData?.roles as string[]).includes(`project_${projectId}_owner`);

  // prepare the approved study for edit form
  const approvedStudy = project ? [{ id: project.study_id, title: project.study_title } as Study] : [];

  const fetchData = async (projectIdParam: string, environmentParam: string) => {
    setLoading(true);
    setError(null);

    try {
      let projectResponse;

      // Fetch based on environment type
      if (environmentParam === "ARC Trusted Research Environment") {
        projectResponse = await getProjectsTreByProjectId({
          path: { projectId: projectIdParam },
        });
      } else {
        // Future: Add DSH and other environment types here
        setError("Unsupported environment type");
        setLoading(false);
        return;
      }

      if (responseIsError(projectResponse) || !projectResponse.data) {
        const errorMsg = extractErrorMessage(projectResponse);
        setError(`Failed to load project: ${errorMsg}`);
        return;
      }
      setProject(projectResponse.data);

      const status = projectResponse.data.status;
      setEditingEnabled(status === "incomplete" || status === "deployed");
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId && typeof projectId === "string" && environment && typeof environment === "string") {
      fetchData(projectId, environment);
    }
  }, [projectId, environment]);

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
      await fetchData(projectId, environment as string);
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
      await fetchData(projectId, environment as string);
    } catch (err) {
      console.error("Failed to approve project:", err);
      setError("Failed to approve project. Please try again.");
    } finally {
      setIsApproving(false);
    }
  };

  const handleProjectCreated = () => {
    setShowEditForm(false);
    if (projectId && typeof projectId === "string" && environment && typeof environment === "string") {
      fetchData(projectId, environment);
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

  const tab = (router.query.tab as string) ?? "project";
  const setTab = (newTab: string) =>
    router.push({ query: { ...router.query, tab: newTab } }, undefined, { shallow: true });

  if (authInProgress) return <Loading />;
  if (!isAuthed) return <LoginFallback />;
  if (loading) return <Loading />;

  if (!isApprovedResearcher) {
    return (
      <>
        <MetaHead
          title="Manage Project | ARC Services Portal"
          description="Manage your project in the ARC Services Portal"
        />

        <div className={styles["not-approved-section"]}>
          <h2>To manage projects, please first set up your profile by completing the approved researcher process.</h2>
          <div className={styles["profile-completion-action"]}>
            <Button onClick={() => router.push("/profile")} size="large">
              Complete your profile
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Title text="Error" />
        <p className={styles.error}>{error}</p>
        <Button onClick={() => router.push("/projects")} variant="secondary">
          Back to Projects
        </Button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className={styles.container}>
        <Title text="Not Found" />
        <p className={styles.error}>Project not found.</p>
        <Button onClick={() => router.push("/projects")} variant="secondary">
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <>
      <MetaHead title={`Manage Project: ${project.name}`} description={`Manage project details for ${project.name}`} />

      <Breadcrumbs
        links={[
          {
            title: "Projects",
            url: "/projects",
          },
          {
            title: project.name,
            url: `/projects/manage?projectId=${project.id}&environment=${project.environment_name}`,
          },
        ]}
      />

      <div className="content">
        {!canApprove && project.status === "incomplete" && (
          <div className={styles["approval-section"]}>
            <p className={styles["approval-info"]}>
              Please review your project details below. Once you are satisfied with the information provided, submit
              your project and an administrator will review it.
            </p>
            <div className={styles["approval-actions"]}>
              {canEdit && (
                <Button
                  onClick={() => setShowEditForm(true)}
                  size="small"
                  variant="secondary"
                  disabled={!editingEnabled}
                >
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
              <Button
                onClick={() => setShowEditForm(true)}
                size="medium"
                variant="secondary"
                disabled={!editingEnabled}
              >
                Edit Project
              </Button>
            </div>
          )}
        </div>

        <div className={"tab-collection"}>
          <Button
            onClick={() => setTab("project")}
            variant="secondary"
            className={`tab ${tab === "project" ? "active" : ""}`}
            cy="project-overview"
          >
            Project Overview
          </Button>

          {project.members && project.members.length > 0 && (
            <Button
              onClick={() => setTab("members")}
              variant="secondary"
              className={`tab ${tab === "members" ? "active" : ""}`}
              cy="project-members"
            >
              Members
            </Button>
          )}

          <Button
            onClick={() => setTab("assets")}
            variant="secondary"
            className={`tab ${tab === "assets" ? "active" : ""}`}
            cy="project-assets"
          >
            Assets
          </Button>
        </div>

        {tab === "project" && (
          <Box>
            <div className={styles.field}>
              <label>Environment:</label>
              <span>{project.environment_name}</span>
            </div>
            <div className={styles.field}>
              <label>Status:</label>
              <span className={styles.status}>
                {project.status} {project.is_pending_deployment_update && " pending update"}
              </span>
            </div>
            <div className={styles.field}>
              <label>Created by:</label>
              <span>{project.creator_username}</span>
            </div>
            <div className={styles.field}>
              <label>Created:</label>
              <span>{new Date(project.created_at).toLocaleDateString()}</span>
            </div>
            <div className={styles.field}>
              <label>Study:</label>
              <span>{project.study_title}</span>
            </div>
            <div className={styles.field}>
              <label>Number of approvals required for egress:</label>
              <span>{project.num_required_egress_approvals}</span>
            </div>
            <div className={styles.field}>
              <label>External encryption enabled:</label>
              <span>{project.external_encryption_enabled ? "Yes" : "No"}</span>
            </div>

            <div className={styles.field}>
              <label>Airlock whitelist:</label>
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
            </div>

            <div className={styles.field}>
              <label>
                Members:
                {project.members && project.members.length > 0 && (
                  <small>
                    To view full member details, see the{" "}
                    <Button onClick={() => setTab("members")} variant="tertiary">
                      Members
                    </Button>{" "}
                    tab.
                  </small>
                )}
              </label>
              {project.members && project.members.length > 0 ? (
                <ul className={styles["field-list"]}>
                  {project.members.map((member, index) => (
                    <li key={index} className={styles["member-item"]}>
                      <span className={styles["member-username"]}>{member.username}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles["empty-message"]}>No members have been added to this project yet.</p>
              )}
            </div>

            <div className={styles.field}>
              <label>
                Assets:
                <small>
                  For full asset details, see the{" "}
                  <Button onClick={() => setTab("assets")} variant="tertiary">
                    Assets
                  </Button>{" "}
                  tab.
                </small>
              </label>
              {project.assets && project.assets.length > 0 ? (
                <ul className={styles["field-list"]}>
                  {project.assets.map((asset) => (
                    <li key={asset.id} className={styles["field-item"]}>
                      <div className={styles["asset-info"]}>
                        <strong>{asset.title}</strong>
                        <p>{asset.description}</p>
                        <span className={styles["asset-tier"]}>Tier {asset.tier}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles["empty-message"]}>No assets have been added to this project yet.</p>
              )}
            </div>
          </Box>
        )}
        {tab === "members" && (
          <Box>
            <div>
              {project.members && (
                <ul className={styles["field-list"]}>
                  {project.members.map((member, index) => (
                    <li key={index} className={styles["member-item"]}>
                      <span className={styles["member-username"]}>{member.username}</span>
                      <div className={styles["member-roles"]}>
                        {member.roles.map((role, roleIndex) => (
                          <span key={roleIndex} className={styles["role-badge"]}>
                            {roleLabel(role)}
                          </span>
                        ))}
                      </div>
                      {member.desktop_config && (
                        <div className={styles["member-desktop-config"]}>
                          <strong>Desktop Config:</strong>
                          <p>{member.desktop_config}</p>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
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

              {deleteError && (
                <Alert type="error">
                  <AlertMessage>{deleteError}</AlertMessage>
                </Alert>
              )}

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
      </div>
    </>
  );
}
