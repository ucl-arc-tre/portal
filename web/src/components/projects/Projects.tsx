import { useState, useEffect } from "react";
import { Study, getProjectsTre, getStudies } from "@/openapi";
import { AnyProject } from "@/types/projects";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import Loading from "@/components/ui/Loading";

import styles from "./Projects.module.css";

export default function Projects() {
  const [projects, setProjects] = useState<AnyProject[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createProjectFormOpen, setCreateProjectFormOpen] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [projectsResponse, studiesResponse] = await Promise.all([getProjectsTre(), getStudies()]);
      setProjects(projectsResponse.data || []);
      setStudies(studiesResponse.data || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setError("Failed to load projects and studies");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProjectClick = () => {
    setCreateProjectFormOpen(true);
  };

  const handleProjectCreated = () => {
    setCreateProjectFormOpen(false);
    fetchData();
  };

  if (isLoading) {
    return <Loading message="Loading projects..." />;
  }

  if (error) {
    return (
      <div className={styles["error-section"]}>
        <h2>Error Loading Data</h2>
        <p>{error}</p>
        <Button onClick={fetchData}>Try Again</Button>
      </div>
    );
  }

  return (
    <>
      {createProjectFormOpen && (
        <Dialog setDialogOpen={setCreateProjectFormOpen}>
          <h2>Create New Project</h2>
          <p>This form is currently being developed. Please check back soon.</p>

          <Button onClick={() => setCreateProjectFormOpen(false)} variant="secondary">
            Close
          </Button>
        </Dialog>
      )}

      {projects.length === 0 ? (
        <div className={styles["no-projects-message"]}>
          <h2>You haven&apos;t created any projects yet</h2>

          <Button onClick={handleCreateProjectClick} size="large">
            Create Your First Project
          </Button>
        </div>
      ) : (
        <>
          <div className={styles["create-project-section"]}>
            <Button onClick={handleCreateProjectClick} size="large">
              Create New Project
            </Button>
          </div>

          <p>Projects list will go here ({projects.length} projects)</p>
        </>
      )}
    </>
  );
}
