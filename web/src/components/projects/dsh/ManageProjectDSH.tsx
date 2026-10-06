import { useAuth } from "@/hooks/useAuth";
import styles from "./ManageProjectDSH.module.css";
import Title from "@/components/ui/Title";
import LoginFallback from "@/components/ui/LoginFallback";
import Loading from "@/components/ui/Loading";
import Button from "@/components/ui/Button";
import Box from "@/components/ui/Box";
import Error from "@/components/ui/Error";
import DetailsField from "@/components/ui/DetailsField";
import { ProjectDsh } from "@/openapi";
import ProjectMember from "../ProjectMember";
import TabCollection from "@/components/ui/TabCollection";
import { projectAccessReviewWarningRequired } from "@/components/shared/exports";
import ProjectAccessReview from "../ProjectAccessReview";
import { useRouter } from "next/router";
import StatusBadge from "@/components/ui/StatusBadge";

type Props = {
  project: ProjectDsh;
  fetchData: () => void;
};

export default function ManageProjectDSH(props: Props) {
  const { project, fetchData } = props;
  const { authInProgress, isAuthed, isAdmin, userData } = useAuth();

  const accessReviewEnabled = process.env.NEXT_PUBLIC_ENABLE_PROJECT_ACCESS_REVIEW === "true";
  const canReviewAccess =
    isAdmin || ((userData?.roles as string[] | undefined)?.includes(`project_${project?.id}_owner`) ?? false);
  const showAccessReviewWarning =
    accessReviewEnabled &&
    canReviewAccess &&
    project?.status === "active" &&
    (project?.last_access_review == null || projectAccessReviewWarningRequired(project.last_access_review));

  const router = useRouter();
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
      {showAccessReviewWarning && (
        <ProjectAccessReview projectId={project.id} environment="dsh" successCallback={async () => fetchData()} />
      )}

      <div className={styles.header}>
        <h2>{project.name}</h2>
        <Button
          href="https://myservices.ucl.ac.uk/self-service/requests/new/select_template?from=wizard&service_id=1473&service_instance_id=3892"
          target="_blank"
          rel="noopener noreferrer"
          variant="secondary"
        >
          Edit Project
        </Button>
      </div>

      <TabCollection
        tabs={[{ name: "project", label: "Project Overview" }, { name: "members" }]}
        defaultTab="project"
      />

      {tab === "project" && (
        <Box>
          <DetailsField label="Environment" value={project.environment_name} />
          <DetailsField label="Study" value={project.study_title} />
          {project.study_owner && (
            <DetailsField label="Study Owner">
              {project.study_owner.name
                ? `${project.study_owner.name} (${project.study_owner.username})`
                : project.study_owner.username}
            </DetailsField>
          )}
          <DetailsField label="Status">
            <StatusBadge status={project.status} type="project" environment="Data Safe Haven" />
          </DetailsField>
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
    </>
  );
}
