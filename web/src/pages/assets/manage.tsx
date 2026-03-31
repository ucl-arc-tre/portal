import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import {
  Study,
  Asset,
  getStudiesByStudyId,
  getStudiesByStudyIdAssetsByAssetId,
  Contract,
  getStudiesByStudyIdAssetsByAssetIdContracts,
} from "@/openapi";
import { extractErrorMessage } from "@/lib/errorHandler";

import Title from "@/components/ui/Title";
import LoginFallback from "@/components/ui/LoginFallback";
import Loading from "@/components/ui/Loading";
import Button from "@/components/ui/Button";

import styles from "./ManageAssetPage.module.css";
import ApprovedResearcherFallback from "@/components/ui/ApprovedResearcherFallback";
import ManageAsset from "@/components/assets/ManageAsset";

export default function ManageAssetPage() {
  const router = useRouter();
  const { studyId, assetId } = router.query;
  const { authInProgress, isAuthed, userData } = useAuth();
  const [study, setStudy] = useState<Study | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isApprovedResearcher = userData?.roles.includes("approved-researcher");

  const fetchData = async (studyIdParam: string, assetIdParam: string) => {
    setLoading(true);
    setError(null);

    try {
      const [studyResponse, assetResponse] = await Promise.all([
        getStudiesByStudyId({ path: { studyId: studyIdParam } }),
        getStudiesByStudyIdAssetsByAssetId({ path: { studyId: studyIdParam, assetId: assetIdParam } }),
      ]);

      if (!studyResponse.response.ok || !studyResponse.data) {
        const errorMsg = extractErrorMessage(studyResponse);
        setError(`Failed to load study: ${errorMsg}`);
        return;
      }
      setStudy(studyResponse.data);

      if (!assetResponse.response.ok || !assetResponse.data) {
        const errorMsg = extractErrorMessage(assetResponse);
        setError(`Failed to load asset: ${errorMsg}`);
        return;
      }
      setAsset(assetResponse.data);
      if (assetResponse.data.contract_ids.length > 0) {
        const contractsResponse = await getStudiesByStudyIdAssetsByAssetIdContracts({
          path: { studyId: studyIdParam, assetId: assetIdParam },
        });

        if (!contractsResponse.response.ok || !contractsResponse.data) {
          const errorMsg = extractErrorMessage(contractsResponse);
          setError(`Failed to load contracts for asset: ${errorMsg}`);
          return;
        }
        setContracts(contractsResponse.data);
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
  if (!isApprovedResearcher) return <ApprovedResearcherFallback />;

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

  return <ManageAsset study={study} asset={asset} contracts={contracts} />;
}
