import router from "next/router";
import { useAuth } from "@/hooks/useAuth";
import styles from "./ManageProjectDSH.module.css";
import Title from "@/components/ui/Title";
import LoginFallback from "@/components/ui/LoginFallback";
import Loading from "@/components/ui/Loading";
import Button from "@/components/ui/Button";
import Box from "@/components/ui/Box";
import Error from "@/components/ui/Error";
import ProjectTabs from "@/components/projects/ProjectTabs";
import DetailsField from "@/components/ui/DetailsField";
import { ProjectDsh } from "@/openapi";
import ProjectMember from "../ProjectMember";

type Props = {
  project: ProjectDsh;
  fetchData: () => void;
};

export default function ManageProjectDSH(props: Props) {
  const { project } = props;
  const { authInProgress, isAuthed } = useAuth();

  const tab = (router.query.tab as "project" | "members" | "assets") ?? "project";

  if (authInProgress) return <Loading />;
  if (!isAuthed) return <LoginFallback />;

  if (!project) {
    return (
      <div>
        <Title text="Not Found" />
        <Error message="Project not found." />
        <Button onClick={() => router.push("/projects")} variant="secondary">
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className={styles.header}>
        <h2>{project.name}</h2>
      </div>

      <ProjectTabs />

      {tab === "project" && (
        <Box>
          <DetailsField label="Environment" value={project.environment_name} />
          <DetailsField label="Study" value={project.study_title} />
          <DetailsField label="Status" value={`${project.status}`} />
        </Box>
      )}

      {tab === "members" && (
        <Box>
          <div>
            {project.members && project.members.length > 0 ? (
              <ul>
                {project.members.map((member, index) => (
                  <ProjectMember member={member} key={index} />
                ))}
              </ul>
            ) : (
              <p>No members have been added to this project yet.</p>
            )}
          </div>
        </Box>
      )}

      {tab === "assets" && "No assets"}
    </>
  );
}
