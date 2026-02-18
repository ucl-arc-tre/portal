import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { Study, Asset, getStudiesByStudyId, getStudiesByStudyIdAssetsByAssetId } from "@/openapi";
import { extractErrorMessage } from "@/lib/errorHandler";

import MetaHead from "@/components/meta/Head";
import Title from "@/components/ui/Title";
import LoginFallback from "@/components/ui/LoginFallback";
import Loading from "@/components/ui/Loading";
import Button from "@/components/ui/Button";

import styles from "./ManageAsset.module.css";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

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
      const studyResponse = await getStudiesByStudyId({
        path: { studyId: studyIdParam },
      });

      if (!studyResponse.response.ok || !studyResponse.data) {
        const errorMsg = extractErrorMessage(studyResponse);
        setError(`Failed to load study: ${errorMsg}`);
        return;
      }
      setStudy(studyResponse.data);

      const assetResponse = await getStudiesByStudyIdAssetsByAssetId({
        path: { studyId: studyIdParam, assetId: assetIdParam },
      });

      if (!assetResponse.response.ok || !assetResponse.data) {
        const errorMsg = extractErrorMessage(assetResponse);
        setError(`Failed to load asset: ${errorMsg}`);
        return;
      }
      setAsset(assetResponse.data);
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
      <Breadcrumbs
        links={[
          {
            title: "Studies",
            url: "/studies",
          },
          {
            title: study.title,
            url: `/studies/manage?studyId=${study.id}`,
          },
          {
            title: asset.title,
            url: `/assets/manage?studyId=${study.id}&assetId=${asset.id}`,
          },
        ]}
      />

      <div className="content">
        <Title text={`Manage Asset: ${asset.title}`} centered />

        <div className={styles["asset-info"]}>
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
            {/* TODO: add contract linkage and list of contracts linked */}
          </div>
        </div>
      </div>
    </>
  );
}
