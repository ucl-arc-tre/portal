import { useState } from "react";
import { Study } from "@/openapi";
import { AnyProject } from "@/types/projects";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";

import styles from "./Projects.module.css";

type Props = {
  projects: AnyProject[];
  studies: Study[];
};

export default function Projects(props: Props) {
  const { projects } = props;
  const [createProjectFormOpen, setCreateProjectFormOpen] = useState(false);

  const handleCreateProjectClick = () => {
    setCreateProjectFormOpen(true);
  };

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
