import { useState, useEffect } from "react";
import { Auth, Study, getProjectsTre, getStudies } from "@/openapi";
import { AnyProject } from "@/types/projects";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";
import CreateProjectForm from "./CreateProjectForm";

import styles from "./Projects.module.css";
import Dialog from "../ui/Dialog";

type Props = {
  userData: Auth;
};

export default function Projects({ userData }: Props) {
  const [projects, setProjects] = useState<AnyProject[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUclStaffModal, setShowUclStaffModal] = useState(false);
  const [createProjectFormOpen, setCreateProjectFormOpen] = useState(false);

  const isApprovedStaffResearcher = !!userData?.roles?.includes("approved-staff-researcher");
  const approvedStudies = studies.filter((study) => study.approval_status === "Approved");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [projectsResponse, studiesResponse] = await Promise.all([getProjectsTre(), getStudies()]);
      setProjects(projectsResponse.data || []);
      setStudies(studiesResponse.data || []);
      setError(null);
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
    if (!isApprovedStaffResearcher) {
      setShowUclStaffModal(true);
      return;
    }
    setCreateProjectFormOpen(true);
  };

  const handleProjectCreated = () => {
    setCreateProjectFormOpen(false);
    fetchData();
  };

  const handleCancelCreate = () => {
    setCreateProjectFormOpen(false);
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

  if (approvedStudies.length === 0 && isApprovedStaffResearcher) {
    return (
      <div className={styles["no-projects-message"]}>
        <h2>You don&apos;t have any approved studies</h2>
        <p>Projects belong to studies. Please create a study and submit it for approval before creating a project.</p>
        <Button href="/studies" size="large">
          Go to Studies
        </Button>
      </div>
    );
  }

  // TODO: Implement admin view for all projects
  return (
    <>
      {showUclStaffModal && (
        <Dialog setDialogOpen={setShowUclStaffModal} cy="ucl-staff-restriction-modal">
          <h2>UCL Staff Only</h2>
          <p>Only UCL staff members can create projects.</p>
          <p>If you believe this is an error, please contact your administrator.</p>

          <div className={styles["ucl-staff-modal-actions"]}>
            <Button onClick={() => setShowUclStaffModal(false)} variant="secondary">
              Close
            </Button>
          </div>
        </Dialog>
      )}

      {createProjectFormOpen && (
        <CreateProjectForm
          studies={studies}
          handleProjectCreated={handleProjectCreated}
          handleCancelCreate={handleCancelCreate}
        />
      )}

      {!isApprovedStaffResearcher && projects.length === 0 ? (
        <div className={styles["no-projects-message"]}>
          <h2>You haven&apos;t been added to any projects yet</h2>
          <p>Any projects you are added to will appear here once they have been created by a member of staff.</p>
        </div>
      ) : projects.length === 0 ? (
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

          <div> Projects list will go here</div>
        </>
      )}
    </>
  );
}
