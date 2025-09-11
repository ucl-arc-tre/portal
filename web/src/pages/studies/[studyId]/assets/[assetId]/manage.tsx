import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { Study, Asset, getStudiesByStudyId, getStudiesByStudyIdAssetsByAssetId } from "@/openapi";

import MetaHead from "@/components/meta/Head";
import Title from "@/components/ui/Title";
import LoginFallback from "@/components/ui/LoginFallback";
import Loading from "@/components/ui/Loading";
import Button from "@/components/ui/Button";

import styles from "./ManageAsset.module.css";

export default function ManageAssetPage() {
  const router = useRouter();
  const { studyId, assetId } = router.query;
  const { authInProgress, isAuthed, userData } = useAuth();
  const [study, setStudy] = useState<Study | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isApprovedResearcher = userData?.roles.includes("approved-researcher");

  const fetchData = async (studyIdParam: string, assetIdParam: string) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch study details
      const studyResponse = await getStudiesByStudyId({
        path: { studyId: studyIdParam },
      });

      if (studyResponse.data) {
        setStudy(studyResponse.data);
      }

      // Fetch specific asset using new endpoint
      const assetResponse = await getStudiesByStudyIdAssetsByAssetId({
        path: { studyId: studyIdParam, assetId: assetIdParam },
      });

      console.log(assetResponse);

      if (assetResponse.data) {
        setAsset(assetResponse.data);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load asset details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studyId && assetId && typeof studyId === "string" && typeof assetId === "string") {
      fetchData(studyId, assetId);
    }
  }, [studyId, assetId]);

  if (authInProgress) return <Loading />;
  if (!isAuthed) return <LoginFallback />;
  if (loading) return <Loading />;

  if (!isApprovedResearcher) {
    return (
      <>
        <MetaHead
          title="Manage Asset | ARC Services Portal"
          description="Manage your asset in the ARC Services Portal"
        />
        <div className={styles["not-approved-section"]}>
          <h2>To manage assets, please first set up your profile by completing the approved researcher process.</h2>
          <div className={styles["profile-completion-action"]}>
            <Button onClick={() => router.push("/profile")} size="large">
              Complete your profile
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Title text="Error" />
        <p className={styles.error}>{error}</p>
        <Button onClick={() => router.push("/studies")} variant="secondary">
          Back to Studies
        </Button>
      </div>
    );
  }

  if (!study || !asset) {
    return (
      <div className={styles.container}>
        <Title text="Not Found" />
        <p className={styles.error}>Study or asset not found.</p>
        <Button onClick={() => router.push("/studies")} variant="secondary">
          Back to Studies
        </Button>
      </div>
    );
  }

  return (
    <>
      <MetaHead title={`Manage Asset: ${asset.title}`} description={`Manage asset details for ${asset.title}`} />
      <div className={styles.container}>
        <div className={styles.breadcrumb}>
          <Button onClick={() => router.push("/studies")} size="small">
            Studies
          </Button>
          <span> / </span>
          <Button onClick={() => router.push(`/studies/manage?studyId=${studyId}`)} size="small">
            {study.title}
          </Button>
          <span> / Assets / {asset.title}</span>
        </div>

        <Title text={`Manage Asset: ${asset.title}`} description={`Part of study: ${study.title}`} />

        <div className={styles.assetInfo}>
          <div className={styles.section}>
            <h3>Asset Details</h3>
            <div className={styles.field}>
              <label>Title:</label>
              <span>{asset.title}</span>
            </div>
            <div className={styles.field}>
              <label>Description:</label>
              <span>{asset.description}</span>
            </div>
            <div className={styles.field}>
              <label>Classification:</label>
              <span>{asset.classification_impact}</span>
            </div>
            <div className={styles.field}>
              <label>Protection:</label>
              <span>{asset.protection}</span>
            </div>
            <div className={styles.field}>
              <label>Status:</label>
              <span className={styles.status}>{asset.status}</span>
            </div>
            {asset.requires_contract && (
              <div className={styles.field}>
                <label>Contract Required:</label>
                <span>Yes</span>
              </div>
            )}
          </div>

          {asset.requires_contract && (
            <div className={styles.section}>
              <h3>Contract Management</h3>
              <p>This asset requires a contract. Contract upload/download functionality will be implemented here.</p>
              {/* TODO: Add contract upload/download UI */}
            </div>
          )}

          <div className={styles.actions}>
            <Button onClick={() => router.back()} variant="secondary">
              Back to Study
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
