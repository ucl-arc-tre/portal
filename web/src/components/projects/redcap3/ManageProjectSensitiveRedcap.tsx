import { useEffect, useState } from "react";
import Link from "next/link";
import { responseIsError } from "@/lib/errorHandler";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/router";
import { ProjectSensitiveRedCap, getProjectsTreByProjectId, getProjectsDshByProjectId } from "@/openapi";
import LoginFallback from "@/components/ui/LoginFallback";
import Loading from "@/components/ui/Loading";
import Box from "@/components/ui/Box";
import DetailsField from "@/components/ui/DetailsField";
import TabCollection from "@/components/ui/TabCollection";
import AssetCard from "@/components/assets/AssetCard";
import styles from "./ManageProjectSensitiveRedcap.module.css";

type Props = {
  project: ProjectSensitiveRedCap;
};

function LinkedProjects({
  ids,
  environment,
}: {
  ids: string[];
  environment: "ARC Trusted Research Environment" | "Data Safe Haven";
}) {
  const [results, setResults] = useState<Record<string, string | null>>({});

  useEffect(() => {
    let cancelled = false;
    const lookup = environment === "Data Safe Haven" ? getProjectsDshByProjectId : getProjectsTreByProjectId;
    const loadProjects = async () => {
      const entries = await Promise.all(
        [...new Set(ids)].map(async (id): Promise<[string, string | null]> => {
          try {
            const response = await lookup({ path: { projectId: id } });
            return [id, responseIsError(response) || !response.data ? null : response.data.name];
          } catch {
            return [id, null];
          }
        })
      );
      if (!cancelled) setResults(Object.fromEntries(entries));
    };
    void loadProjects();
    return () => {
      cancelled = true;
    };
  }, [ids, environment]);

  if (ids.length === 0) return <>None</>;

  return (
    <ul className={styles.linkedProjects}>
      {[...new Set(ids)].map((id) => (
        <li key={id}>
          {results[id] === undefined ? (
            "Loading project…"
          ) : results[id] === null ? (
            "Project unavailable or access denied"
          ) : (
            <Link href={{ pathname: "/projects/manage", query: { projectId: id, environment } }}>{results[id]}</Link>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function ManageProjectSensitiveRedcap({ project }: Props) {
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
          <DetailsField label="Description" value={project.description} />
          <DetailsField label="Environment" value={project.environment_name} />
          <DetailsField label="Study" value={project.study_title} />
          <DetailsField label="Linked TRE Projects">
            <LinkedProjects
              key={`${project.id}-tre`}
              ids={project.project_tre_ids}
              environment="ARC Trusted Research Environment"
            />
          </DetailsField>
          <DetailsField label="Linked DSH Projects">
            <LinkedProjects key={`${project.id}-dsh`} ids={project.project_dsh_ids} environment="Data Safe Haven" />
          </DetailsField>
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
