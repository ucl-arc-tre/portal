import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/router";
import { ProjectRedcapTier3 } from "@/openapi";
import LoginFallback from "@/components/ui/LoginFallback";
import Loading from "@/components/ui/Loading";
import Box from "@/components/ui/Box";
import DetailsField from "@/components/ui/DetailsField";
import TabCollection from "@/components/ui/TabCollection";
import AssetCard from "@/components/assets/AssetCard";
import styles from "./ManageProjectRedcapTier3.module.css";

type Props = {
  project: ProjectRedcapTier3;
};

export default function ManageProjectRedcapTier3({ project }: Props) {
  const { authInProgress, isAuthed } = useAuth();
  const router = useRouter();
  const tab = router.query.tab === "assets" ? "assets" : "project";

  if (authInProgress) return <Loading />;
  if (!isAuthed) return <LoginFallback />;

  return (
    <>
      <div className={styles.header}>
        <h2>{project.name}</h2>
      </div>
      <TabCollection
        tabs={[
          { name: "project", label: "Project Overview" },
          { name: "assets", count: project.assets?.length ?? 0 },
        ]}
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
        </Box>
      )}
      {tab === "assets" && (
        <Box>
          {project.assets && project.assets.length > 0 ? (
            <div className={styles.assets}>
              {project.assets.map((asset) => (
                <AssetCard key={asset.id} studyId={project.study_id} asset={asset} showRiskScore={false} />
              ))}
            </div>
          ) : (
            <p>No assets have been added to this project yet.</p>
          )}
        </Box>
      )}
    </>
  );
}
