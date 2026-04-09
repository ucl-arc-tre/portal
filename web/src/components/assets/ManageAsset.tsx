import { Asset, AssetBase, Contract, putStudiesByStudyIdAssetsByAssetId, Study } from "@/openapi";

import styles from "./ManageAsset.module.css";
import { Alert, AlertMessage, HelperText } from "../shared/uikitExports";
import ContractCard from "../contracts/ContractCard";
import AssetForm from "./AssetForm";
import Button from "../ui/Button";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { extractErrorMessage } from "@/lib/errorHandler";

type ManageAssetProps = {
  study: Study;
  asset: Asset;
  contracts: Contract[];
  fetchData: (studyId: string, assetId: string) => Promise<void>;
};

export default function ManageAsset(props: ManageAssetProps) {
  const { study, asset, contracts, fetchData } = props;
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { userData } = useAuth();
  const isStudyOwner =
    (userData?.roles.includes("information-asset-owner") && study.owner_username === userData?.username) || false;
  const isStudyAdmin = (!!userData && study.additional_study_admin_usernames.includes(userData.username)) || false;
  const isStudyOwnerOrAdmin = isStudyOwner || isStudyAdmin;

  const onEditComplete = async (assetData: AssetFormData) => {
    try {
      const response = await putStudiesByStudyIdAssetsByAssetId({
        path: { studyId: study.id, assetId: asset.id },
        body: assetData as AssetBase,
      });

      if (!response.response.ok) {
        const errorMsg = extractErrorMessage(response);
        throw new Error(errorMsg);
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error("Search failed:", error);
      setError("Search failed. Please try again.");
    }

    fetchData(study.id, asset.id);
  };
  return (
    <>
      {isFormOpen && (
        <AssetForm closeModal={() => setIsFormOpen(false)} editingAsset={asset} handleAssetSubmit={onEditComplete} />
      )}

      {error && (
        <Alert type="error">
          <AlertMessage>{error}</AlertMessage>
        </Alert>
      )}

      {isStudyOwnerOrAdmin && (
        <div className={styles["asset-actions"]}>
          <Button variant="primary" size="small" onClick={() => setIsFormOpen(true)} data-cy="edit-asset-button">
            Edit Asset
          </Button>
        </div>
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
          <div className={styles.field}>
            <label>Contract Required:</label>
            <span>{asset.requires_contract ? "Yes" : "No"}</span>
          </div>

          {contracts.length > 0 ? (
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
          ) : (
            <p>No associated contracts.</p>
          )}
        </div>
      </div>
    </>
  );
}
