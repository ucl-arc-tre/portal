import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { AnyProject } from "@/types/projects";
import { getProjectsDshByProjectId, getProjectsTreByProjectId, ProjectDsh, ProjectTre } from "@/openapi";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";

import MetaHead from "@/components/meta/Head";
import Title from "@/components/ui/Title";
import LoginFallback from "@/components/ui/LoginFallback";
import Loading from "@/components/ui/Loading";
import Button from "@/components/ui/Button";
import styles from "./ManageProject.module.css";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Error from "@/components/ui/Error";
import ManageProjectTRE from "@/components/projects/tre/ManageProjectTRE";
import ManageProjectDSH from "@/components/projects/dsh/ManageProjectDSH";

export default function ManageProjectPage() {
  const router = useRouter();
  const { projectId, environment } = router.query;
  const { authInProgress, isAuthed, isApprovedResearcher } = useAuth();
  const [project, setProject] = useState<AnyProject | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (
    projectIdParam: string | string[] | undefined,
    environmentParam: string | string[] | undefined
  ) => {
    setLoading(true);
    setError(null);

    if (!projectIdParam || typeof projectIdParam !== "string") {
      setError("Missing or invalid project ID");
      return;
    }
    if (!environmentParam || typeof environmentParam !== "string") {
      setError("Missing or invalid environment ID");
      return;
    }

    try {
      let projectResponse;

      switch (environmentParam) {
        case "ARC Trusted Research Environment":
          projectResponse = await getProjectsTreByProjectId({
            path: { projectId: projectIdParam },
          });
          break;
        case "Data Safe Haven":
          projectResponse = await getProjectsDshByProjectId({
            path: { projectId: projectIdParam },
          });
          break;
        default:
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
        <Error message={error} />
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
        <Error message="Project not found." />
        <Button onClick={() => router.push("/projects")} variant="secondary">
          Back to Projects
        </Button>
      </div>
    );
  }

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
        {loading && <Loading />}
        {environment == "ARC Trusted Research Environment" && (
          <ManageProjectTRE project={project as ProjectTre} fetchData={() => fetchData(projectId, environment)} />
        )}
        {environment == "Data Safe Haven" && (
          <ManageProjectDSH project={project as ProjectDsh} fetchData={() => fetchData(projectId, environment)} />
        )}
      </div>
    </>
  );
}
