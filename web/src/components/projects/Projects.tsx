import { useState, useEffect, useReducer } from "react";
import { Project, Study, getProjects, getStudies } from "@/openapi";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";
import ProjectForm from "./ProjectForm";
import ProjectCardsList from "./ProjectCardsList";
import AllProjects from "./AllProjects";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";

import styles from "./Projects.module.css";
import Dialog from "../ui/Dialog";
import Error from "../ui/Error";
import { ProjectDefinition } from "../shared/entityDefinitions";
import { InfoIcon } from "../shared/uikitExports";
import { useAuth } from "@/hooks/useAuth";

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [studies, setStudies] = useState<Study[] | undefined>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUclStaffModal, setShowUclStaffModal] = useState(false);
  const [createProjectFormOpen, setCreateProjectFormOpen] = useState(false);
  const [infoCalloutExpanded, setInfoCalloutExpanded] = useState(false);
  const [refreshToken, refreshAllProjects] = useReducer((x) => x + 1, 0);

  const { isAdmin, isTreOpsStaff, isDshOpsStaff, isApprovedStaffResearcher } = useAuth();

  const approvedStudies = studies?.filter((study) => study.approval_status === "Approved");
  const canSeeAllProjects = isTreOpsStaff || isDshOpsStaff || isAdmin;
  const creationEnabled = process.env.NEXT_PUBLIC_ENABLE_PROJECT_CREATION === "true";

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let projectsResponse, studiesResponse;
      if (canSeeAllProjects) {
        projectsResponse = await getProjects();
      } else {
        [projectsResponse, studiesResponse] = await Promise.all([getProjects(), getStudies()]);
      }

      if (responseIsError(projectsResponse) || !projectsResponse.data) {
        const errorMsg = extractErrorMessage(projectsResponse);
        setError(`Failed to fetch projects: ${errorMsg}`);
        return;
      }

      if (studiesResponse && (responseIsError(studiesResponse) || !studiesResponse.data)) {
        const errorMsg = extractErrorMessage(studiesResponse);
        setError(`Failed to fetch studies: ${errorMsg}`);
        return;
      }

      setProjects(projectsResponse.data);
      setStudies(studiesResponse?.data);
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
    refreshAllProjects();
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
        <Error message={error} />
        <Button onClick={fetchData}>Try Again</Button>
      </div>
    );
  }

  if (!canSeeAllProjects && approvedStudies && approvedStudies.length === 0 && isApprovedStaffResearcher) {
    return (
      <div className={styles["no-projects-message"]}>
        <h2>You don&apos;t have any approved Studies</h2>
        <p>Projects belong to Studies. Please create a Study and submit it for approval before creating a Project.</p>
        <Button href="/studies" size="large">
          Go to Studies
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {(canSeeAllProjects || projects.length > 0) && (
        <>
          <div className={styles.header}>
            <h2>
              {canSeeAllProjects ? "All Projects" : "Your Projects"}{" "}
              <Button
                onClick={() => setInfoCalloutExpanded(!infoCalloutExpanded)}
                variant="tertiary"
                size="small"
                inline
                aria-label="Toggle project definition"
              >
                <InfoIcon />
              </Button>
            </h2>
            {isApprovedStaffResearcher && !canSeeAllProjects && projects.length > 0 && creationEnabled && (
              <Button onClick={handleCreateProjectClick} size="medium" cy="create-project-button">
                Create Project
              </Button>
            )}
          </div>
          <div className={styles.line}></div>
        </>
      )}

      {infoCalloutExpanded && <ProjectDefinition />}

      {showUclStaffModal && (
        <Dialog setDialogOpen={setShowUclStaffModal} cy="ucl-staff-restriction-modal">
          <h2>UCL Staff Only</h2>
          <p>Only UCL staff members can create Projects.</p>
          <p>If you believe this is an error, please contact your administrator.</p>

          <div className={styles["ucl-staff-modal-actions"]}>
            <Button onClick={() => setShowUclStaffModal(false)} variant="secondary">
              Close
            </Button>
          </div>
        </Dialog>
      )}

      {createProjectFormOpen && approvedStudies && (
        <ProjectForm
          approvedStudies={approvedStudies}
          handleProjectCreated={handleProjectCreated}
          handleCancelCreate={handleCancelCreate}
        />
      )}

      {canSeeAllProjects ? (
        <AllProjects refreshToken={refreshToken} />
      ) : !isApprovedStaffResearcher && projects.length === 0 ? (
        <div className={styles["no-projects-message"]}>
          <h2>You haven&apos;t been added to any Projects yet</h2>
          <p>Any Projects you are added to will appear here once they have been created by a member of staff.</p>
        </div>
      ) : projects.length === 0 ? (
        <div className={styles["no-projects-message"]}>
          <h2>You haven&apos;t created any Projects yet</h2>
          <ProjectDefinition />
          {creationEnabled && (
            <Button onClick={handleCreateProjectClick} size="large" cy="create-project-button">
              Create Your First Project
            </Button>
          )}
        </div>
      ) : (
        <ProjectCardsList projects={projects} />
      )}
    </div>
  );
}
