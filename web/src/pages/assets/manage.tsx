import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import {
  Study,
  Asset,
  AssetBase,
  getStudiesByStudyId,
  getStudiesByStudyIdAssetsByAssetId,
  putStudiesByStudyIdAssetsByAssetId,
  deleteStudiesByStudyIdAssetsByAssetId,
  Contract,
  getStudiesByStudyIdAssetsByAssetIdContracts,
} from "@/openapi";
import { extractErrorMessage } from "@/lib/errorHandler";

import MetaHead from "@/components/meta/Head";
import Title from "@/components/ui/Title";
import LoginFallback from "@/components/ui/LoginFallback";
import Loading from "@/components/ui/Loading";
import Button from "@/components/ui/Button";

import styles from "./ManageAsset.module.css";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ContractCard from "@/components/contracts/ContractCard";
import { Alert, AlertMessage, HelperText } from "@/components/shared/uikitExports";
import ApprovedResearcherFallback from "@/components/ui/ApprovedResearcherFallback";
import { formatDate } from "@/components/shared/exports";
import AssetCreationForm from "@/components/assets/AssetCreationForm";

export default function ManageAssetPage() {
  const router = useRouter();
  const { studyId, assetId } = router.query;
  const { authInProgress, isAuthed, userData } = useAuth();
  const [study, setStudy] = useState<Study | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isApprovedResearcher = userData?.roles.includes("approved-researcher");

  const isStudyOwner =
    (userData?.roles.includes("information-asset-owner") && study?.owner_username === userData.username) || false;
  const isStudyAdmin = (userData && study?.additional_study_admin_usernames.includes(userData?.username)) || false;
  const canModify = isStudyOwner || isStudyAdmin;

  const handleAssetDelete = async () => {
    if (!study || !asset) return;

    const confirmed = window.confirm("Are you sure you want to delete this asset? This operation cannot be undone.");
    if (!confirmed) return;

    setDeleteError(null);

    const response = await deleteStudiesByStudyIdAssetsByAssetId({
      path: { studyId: study.id, assetId: asset.id },
    });

    if (!response.response.ok) {
      const errorMsg = extractErrorMessage(response);
      setDeleteError(`Delete failed: ${errorMsg}`);
      return;
    }

    router.push(`/studies/manage?studyId=${study.id}`);
  };

  const handleAssetUpdate = async (assetData: AssetFormData) => {
    if (!study || !asset) return;

    const response = await putStudiesByStudyIdAssetsByAssetId({
      path: { studyId: study.id, assetId: asset.id },
      body: assetData as AssetBase,
    });

    if (!response.response.ok || !response.data) {
      throw new Error(extractErrorMessage(response));
    }

    setAsset(response.data);
    setShowEditModal(false);
  };

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
        <div className={styles.header}>
          <Title text={`Manage Asset: ${asset.title}`} />

          {canModify && (
            <div className={styles["header-actions"]}>
              <Button onClick={() => setShowEditModal(true)} variant="primary" cy="asset-edit">
                Edit
              </Button>
              <Button onClick={handleAssetDelete} className="delete-button" cy="asset-delete">
                Delete
              </Button>
            </div>
          )}
        </div>

        {deleteError && (
          <Alert type="error">
            <AlertMessage>{deleteError}</AlertMessage>
          </Alert>
        )}

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
              <label>Status:</label>
              <span className={styles.status}>{asset.status}</span>
            </div>
            <div className={styles.field}>
              <label>Classification:</label>
              <span>{asset.classification_impact}</span>
            </div>
            <div className={styles.field}>
              <label>Tier:</label>
              <span>{asset.tier}</span>
            </div>
            <div className={styles.field}>
              <label>Protection:</label>
              <span>{asset.protection}</span>
            </div>
            <div className={styles.field}>
              <label>Legal Basis:</label>
              <span>{asset.legal_basis}</span>
            </div>
            <div className={styles.field}>
              <label>Format:</label>
              <span>{asset.format}</span>
            </div>
            <div className={styles.field}>
              <label>Expiry Date:</label>
              <span>{formatDate(asset.expires_at)}</span>
            </div>
            <div className={styles.field}>
              <label>Locations:</label>
              <span>{asset.locations.map((location) => location.replace(/_/g, " ")).join(", ")}</span>
            </div>

            <div className={styles.field}>
              <label>Contract Required:</label>
              <span>{asset.requires_contract ? "Yes" : "No"}</span>
            </div>
            <div className={styles.field}>
              <label>Has DSPT:</label>
              <span>{asset.has_dspt ? "Yes" : "No"}</span>
            </div>
            <div className={styles.field}>
              <label>Stored Outside UK/EEA:</label>
              <span>{asset.stored_outside_uk_eea ? "Yes" : "No"}</span>
            </div>

            {contracts.length > 0 && (
              <div className={styles.field}>
                <label>
                  Associated Contracts:
                  <HelperText>
                    <small>
                      To manage contracts, please navigate to the{" "}
                      <a href={`/studies/manage?studyId=${study.id}`}>Study</a> page.
                    </small>
                  </HelperText>
                </label>
                <ul>
                  {contracts.map((contract) => (
                    <ContractCard key={contract.id} contract={contract} studyId={study.id} />
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {showEditModal && (
          <AssetCreationForm
            editingAsset={asset}
            handleAssetSubmit={handleAssetUpdate}
            closeModal={() => setShowEditModal(false)}
          />
        )}
      </div>
    </>
  );
}
