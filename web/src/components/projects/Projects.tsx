import { useState, useEffect } from "react";
import { Auth, Study, Project, getProjects, getStudies } from "@/openapi";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";
import CreateProjectForm from "./CreateProjectForm";
import ProjectCardsList from "./ProjectCardsList";
import { extractErrorMessage } from "@/lib/errorHandler";

import styles from "./Projects.module.css";
import Dialog from "../ui/Dialog";

type Props = {
  userData: Auth;
};

export default function Projects({ userData }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUclStaffModal, setShowUclStaffModal] = useState(false);
  const [createProjectFormOpen, setCreateProjectFormOpen] = useState(false);

  const isApprovedStaffResearcher = !!userData?.roles?.includes("approved-staff-researcher");
  const isOpsStaff = !!userData?.roles?.includes("tre-ops-staff");
  const approvedStudies = studies.filter((study) => study.approval_status === "Approved");

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [projectsResponse, studiesResponse] = await Promise.all([getProjects(), getStudies()]);

      if (!projectsResponse.response.ok) {
        const errorMsg = extractErrorMessage(projectsResponse);
        setError(`Failed to fetch projects: ${errorMsg}`);
        return;
      }

      if (!studiesResponse.response.ok) {
        const errorMsg = extractErrorMessage(studiesResponse);
        setError(`Failed to fetch studies: ${errorMsg}`);
        return;
      }

      setProjects(projectsResponse.data || []);
      setStudies(studiesResponse.data || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setError("Failed to load projects and studies. Please try again later.");
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

  if (approvedStudies.length === 0 && isApprovedStaffResearcher && !isOpsStaff) {
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
          approvedStudies={approvedStudies}
          handleProjectCreated={handleProjectCreated}
          handleCancelCreate={handleCancelCreate}
        />
      )}

      {isOpsStaff && projects.length === 0 ? (
        <div className={styles["no-projects-message"]}>
          <h2>No projects are currently submitted for review</h2>
          <p>Projects created by users will appear here for approval.</p>
        </div>
      ) : !isApprovedStaffResearcher && projects.length === 0 ? (
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
          {!isOpsStaff && (
            <div className={styles["create-project-section"]}>
              <Button onClick={handleCreateProjectClick} size="large">
                Create New Project
              </Button>
            </div>
          )}

          <ProjectCardsList projects={projects} isOpsStaff={isOpsStaff} fetchData={fetchData} />
        </>
      )}
    </>
  );
}
