import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import MetaHead from "@/components/meta/Head";
import Projects from "@/components/projects/Projects";
import LoginFallback from "@/components/ui/LoginFallback";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";
import { Project } from "@/openapi";

import styles from "./ProjectsPage.module.css";

export default function ProjectsPage() {
  const router = useRouter();
  const { authInProgress, isAuthed, userData } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isApprovedResearcher = userData?.roles.includes("approved-researcher");

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      // WIP: need to implement actual project fetching
      // const response = await getProjects();
      setProjects([]);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      setError("Failed to fetch projects");
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isApprovedResearcher) return;
    fetchProjects();
  }, [isApprovedResearcher]);

  if (authInProgress) return null;
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
            <Button onClick={() => fetchProjects()}>Try Again</Button>
          </div>
        </div>
      </>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <>
        <MetaHead
          title="Projects Not Found | ARC Services Portal"
          description="Projects not found in the ARC Services Portal"
        />

        <div className={styles["not-found-section"]}>
          <h2>No Projects Found</h2>
          <div className={styles["navigation-action"]}>
            <Button onClick={() => router.push("/")} variant="secondary">
              Back to Home
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

      <div>
        <Projects projects={projects} />
      </div>
    </>
  );
}
