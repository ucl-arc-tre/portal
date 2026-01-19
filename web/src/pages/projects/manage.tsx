import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { AnyProject } from "@/types/projects";
import {
  getProjectsTreByProjectId,
  postProjectsTreAdminByProjectIdApprove,
  patchProjectsTreByProjectIdPending,
  patchProjectsTreByProjectIdArchive,
  Study,
} from "@/openapi";

import MetaHead from "@/components/meta/Head";
import Title from "@/components/ui/Title";
import LoginFallback from "@/components/ui/LoginFallback";
import Loading from "@/components/ui/Loading";
import Button from "@/components/ui/Button";
import CreateProjectForm from "@/components/projects/CreateProjectForm";
import Dialog from "@/components/ui/Dialog";
import { Alert, AlertMessage } from "@/components/shared/exports";

import styles from "./ManageProject.module.css";
import Box from "@/components/ui/Box";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

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
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const isApprovedResearcher = userData?.roles.includes("approved-researcher");
  const isAdmin = userData?.roles.includes("admin");
  const isTreOpsStaff = userData?.roles.includes("tre-ops-staff");
  const canApprove = isAdmin || isTreOpsStaff;
  const canEdit = (userData?.roles as string[]).includes(`project_${projectId}_owner`);

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

      if (projectResponse.response.ok && projectResponse.data) {
        setProject(projectResponse.data);
      } else {
        if (projectResponse.response.status === 404) {
          setError("Project not found or you don't have access to it.");
        } else if (projectResponse.response.status === 403) {
          setError("You don't have permission to access this project.");
        } else if (projectResponse.response.status === 406) {
          setError("The project ID is not valid. Please check and try again.");
        } else {
          setError("Failed to load project. Please try again later.");
        }
      }
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

      if (response.response.ok) {
        await fetchData(projectId, environment as string);
      } else {
        setError("Failed to submit project. Please try again.");
      }
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

      if (response.response.ok) {
        // Refresh project data to show updated status
        await fetchData(projectId, environment as string);
      } else {
        setError("Failed to approve project. Please try again.");
      }
    } catch (err) {
      console.error("Failed to approve project:", err);
      setError("Failed to approve project. Please try again.");
    } finally {
      setIsApproving(false);
    }
  };

  const handleArchive = async () => {
    if (!projectId || typeof projectId !== "string") return;

    setIsArchiving(true);
    setError(null);

    try {
      const response = await patchProjectsTreByProjectIdArchive({
        path: { projectId },
      });

      if (response.response.ok) {
        setShowArchiveModal(false);
        await fetchData(projectId, environment as string);
      } else {
        throw new Error(`Failed to archive project: ${response.response.status} ${response.response.statusText}`);
      }
    } catch (err) {
      console.error("Failed to archive project:", err);
      setError("Failed to archive project. Please try again.");
    } finally {
      setIsArchiving(false);
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
        <Title text={canApprove ? "Manage Project Approval" : `Manage Project: ${project.name}`} centered />

        {!canApprove && project.approval_status === "Incomplete" && (
          <div className={styles["approval-section"]}>
            <p className={styles["approval-info"]}>
              Please review your project details below. Once you are satisfied with the information provided, submit
              your project and an administrator will review it.
            </p>
            <div className={styles["approval-actions"]}>
              {canEdit && (
                <Button onClick={() => setShowEditForm(true)} size="large">
                  Edit
                </Button>
              )}
              <Button onClick={handleSubmit} disabled={isSubmitting} size="large">
                {isSubmitting ? "Submitting..." : "Create Project"}
              </Button>
            </div>
          </div>
        )}

        {canEdit && project.approval_status !== "Incomplete" && project.approval_status !== "Archived" && (
          <div className={styles["approval-section"]}>
            <div className={styles["approval-actions"]}>
              <Button onClick={() => setShowEditForm(true)} size="large">
                Edit
              </Button>
              <Button onClick={() => setShowArchiveModal(true)} size="large" variant="secondary">
                Archive
              </Button>
            </div>
          </div>
        )}

        {canApprove && project.approval_status === "Pending" && (
          <div className={styles["approval-section"]}>
            <p className={styles["approval-info"]}>
              Please review the below project details, members, and assets before approving this project.
            </p>
            <div className={styles["approval-actions"]}>
              <Button onClick={handleApprove} disabled={isApproving} size="large">
                {isApproving ? "Approving..." : "Accept Project"}
              </Button>
            </div>
          </div>
        )}

        <Box>
          <h2 className={styles["section-title"]}>Project Details</h2>
          <div className={styles.field}>
            <label>Name:</label>
            <span>{project.name}</span>
          </div>
          <div className={styles.field}>
            <label>Environment:</label>
            <span>{project.environment_name}</span>
          </div>
          <div className={styles.field}>
            <label>Status:</label>
            <span className={styles.status}>{project.approval_status}</span>
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
        </Box>

        <Box>
          <h2 className={styles["section-title"]}>Project Members</h2>
          {project.members && project.members.length > 0 ? (
            <ul className={styles["members-list"]}>
              {project.members.map((member, index) => (
                <li key={index} className={styles["member-item"]}>
                  <span className={styles["member-username"]}>{member.username}</span>
                  <div className={styles["member-roles"]}>
                    {member.roles.map((role, roleIndex) => (
                      <span key={roleIndex} className={styles["role-badge"]}>
                        {role.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles["empty-message"]}>No members have been added to this project yet.</p>
          )}
        </Box>

        <Box>
          <h2 className={styles["section-title"]}>Assets</h2>
          {project.assets && project.assets.length > 0 ? (
            <ul className={styles["assets-list"]}>
              {project.assets.map((asset) => (
                <li key={asset.id} className={styles["asset-item"]}>
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
        </Box>

        {showEditForm && project && (
          <CreateProjectForm
            approvedStudies={approvedStudy}
            editingProject={project}
            handleProjectCreated={() => handleProjectCreated()}
            handleCancelCreate={() => handleCancelCreate()}
          />
        )}

        {showArchiveModal && (
          <Dialog setDialogOpen={() => setShowArchiveModal(false)}>
            <div className={styles["archive-dialog"]}>
              <h2>Archive Project</h2>
              <p>
                Are you sure you want to archive project <strong>{project?.name}</strong>?
              </p>
              <p>Archiving this project will:</p>
              <ul>
                <li>
                  Make the project <strong>read-only</strong> - no further edits will be allowed
                </li>
                <li>Keep all project data and configuration intact</li>
                <li>Remove it from active project lists (but it will still be visible at the bottom)</li>
                <li>Require administrator approval to unarchive in the future</li>
              </ul>
              <p>
                <strong>Note:</strong> This is different from deleting - archived projects can be restored later if
                needed.
              </p>

              {error && (
                <Alert type="error">
                  <AlertMessage>{error}</AlertMessage>
                </Alert>
              )}

              <div className={styles["archive-actions"]}>
                <Button onClick={() => setShowArchiveModal(false)} variant="secondary" disabled={isArchiving}>
                  Cancel
                </Button>
                <Button onClick={handleArchive} variant="primary" disabled={isArchiving}>
                  {isArchiving ? "Archiving..." : "Archive Project"}
                </Button>
              </div>
            </div>
          </Dialog>
        )}
      </div>
    </>
  );
}
