import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { AnyProject } from "@/types/projects";
import { getProjectsTreByProjectId } from "@/openapi";

import MetaHead from "@/components/meta/Head";
import Title from "@/components/ui/Title";
import LoginFallback from "@/components/ui/LoginFallback";
import Loading from "@/components/ui/Loading";
import Button from "@/components/ui/Button";

import styles from "./ManageProject.module.css";

export default function ManageProjectPage() {
  const router = useRouter();
  const { projectId, environment } = router.query;
  const { authInProgress, isAuthed, userData } = useAuth();
  const [project, setProject] = useState<AnyProject | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isApprovedResearcher = userData?.roles.includes("approved-researcher");

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

      <Title text={`Manage Project: ${project.name}`} />

      <div className={styles["project-info"]}>
        <div className={styles.section}>
          <h3>Project Details</h3>
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
        </div>

        <div className={styles.section}>
          <h3>Project Members</h3>
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
        </div>

        <div className={styles.section}>
          <h3>Assets</h3>
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
        </div>
      </div>
    </>
  );
}
