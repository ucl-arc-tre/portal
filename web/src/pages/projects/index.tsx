import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import MetaHead from "@/components/meta/Head";
import Projects from "@/components/projects/Projects";
import LoginFallback from "@/components/ui/LoginFallback";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";
import { AnyProject } from "@/types/projects";
import { getProjectsTre, getStudies, Study } from "@/openapi";
import Callout from "@/components/ui/Callout";
import Title from "@/components/ui/Title";

import styles from "./ProjectsPage.module.css";

export default function ProjectsPage() {
  const router = useRouter();
  const { authInProgress, isAuthed, userData } = useAuth();
  const [projects, setProjects] = useState<AnyProject[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isApprovedResearcher = userData?.roles.includes("approved-researcher");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [projectsResponse, studiesResponse] = await Promise.all([getProjectsTre(), getStudies()]);
      setProjects(projectsResponse.data || []);
      setStudies(studiesResponse.data || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setError("Failed to fetch data");
      setProjects([]);
      setStudies([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isApprovedResearcher) return;
    fetchData();
  }, [isApprovedResearcher]);

  if (authInProgress || !userData) return null;
  if (!isAuthed) return <LoginFallback />;

  if (!isApprovedResearcher) {
    return (
      <>
        <MetaHead
          title="Manage Projects | ARC Services Portal"
          description="Manage your projects in the ARC Services Portal"
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

  if (isLoading) {
    return (
      <>
        <MetaHead
          title="Manage Projects | ARC Services Portal"
          description="Manage your projects in the ARC Services Portal"
        />
        <Loading message="Loading projects..." />
      </>
    );
  }

  if (error) {
    return (
      <>
        <MetaHead
          title="Manage Projects | ARC Services Portal"
          description="Manage your projects in the ARC Services Portal"
        />
        <div className={styles["error-section"]}>
          <h2>Error Loading Projects</h2>
          <p>{error}</p>
          <div className={styles["error-recovery-actions"]}>
            <Button onClick={() => router.push("/")} variant="secondary">
              Back to Home
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (!studies || studies.length === 0) {
    return (
      <>
        <MetaHead
          title="Projects | ARC Services Portal"
          description="Manage your projects in the ARC Services Portal"
        />
        <Title text={"Projects"} centered />
        <div className={styles["prerequisite-section"]}>
          <h2>Create a study first</h2>
          <p>Before you can create a project, you need to create at least one study.</p>
          <div className={styles["navigation-action"]}>
            <Button onClick={() => router.push("/studies")} size="large">
              Go to Studies
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <MetaHead
        title="Projects | ARC Services Portal"
        description="View and modify projects in the ARC Services Portal"
      />

      <Callout construction></Callout>

      <Title text={"Projects"} centered />

      <Callout definition>
        A project belongs to a study and can contain multiple assets. Have a look at our
        <Button href="/glossary" variant="tertiary" size="small" inline>
          Glossary
        </Button>
        for more detailed information.
      </Callout>

      <Projects projects={projects} studies={studies} />
    </>
  );
}
