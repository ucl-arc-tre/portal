import { useState, useEffect, useCallback } from "react";
import Button from "@/components/ui/Button";
import ContractUploadForm from "./ContractUploadForm";
import ContractCard from "./ContractCard";
import { getStudiesByStudyIdAssetsByAssetIdContracts, Contract, Study, Asset } from "@/openapi";
import styles from "./ContractManagement.module.css";
import Box from "@/components/ui/Box";

type ContractManagementProps = {
  study: Study;
  asset: Asset;
  canModify: boolean;
};

export default function ContractManagement({ study, asset, canModify }: ContractManagementProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);

  const fetchContracts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getStudiesByStudyIdAssetsByAssetIdContracts({
        path: { studyId: study.id, assetId: asset.id },
      });

      if (response.response.ok && response.data) {
        setContracts(response.data);
      } else {
        throw new Error(`Failed to fetch contracts: ${response.response.status} ${response.response.statusText}`);
      }
    } catch (err) {
      console.error("Failed to load contracts:", err);
      setError("Failed to load contracts. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [study.id, asset.id]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    setEditingContract(null);
    fetchContracts();
  };

  const handleEditContract = (contract: Contract) => {
    if (!canModify) {
      return;
    }
    setEditingContract(contract);
    setShowUploadModal(true);
  };

  return (
    <Box>
      {canModify ? (
        <>
          {" "}
          <div className={styles.header}>
            <h3>Contract Management</h3>
            <Button onClick={() => setShowUploadModal(true)} variant="primary">
              Add Contract
            </Button>
          </div>
          <p className={styles.description}>
            Manage contract documents for this asset. Upload PDF contracts and track their status.
          </p>
        </>
      ) : (
        <div className={styles.header}>
          <h3>Contracts</h3>
        </div>
      )}

      {contracts.length === 0 &&
        (asset.requires_contract || study.involves_external_users || study.involves_third_party) && (
          <div className={styles["contract-requirement-notice"]}>
            <div>
              Based on your responses while making your Study and Asset, uploading a contract is required. This is
              because you said:
              <ul>
                {asset.requires_contract && <li>This asset requires a contract.</li>}
                {study.involves_external_users && <li>Your study involves external users.</li>}
                {study.involves_third_party && <li>Your study involves third parties.</li>}
              </ul>
              <p>Please ensure you upload a valid contract document to comply with our policies.</p>
            </div>
          </div>
        )}

      {error && (
        <div className={styles.error}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {isLoading ? (
        <div className={styles.loading}>Loading contracts...</div>
      ) : contracts.length === 0 ? (
        <div className={styles["empty-state"]}>
          <h4>No contracts uploaded</h4>
          {canModify && <p>Upload your first contract document to get started.</p>}
        </div>
      ) : (
        <div className={styles["contracts-list"]}>
          {contracts.map((contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              studyId={study.id}
              assetId={asset.id}
              onEdit={() => handleEditContract(contract)}
              canModify={canModify}
            />
          ))}
        </div>
      )}

      {canModify && (
        <ContractUploadForm
          study={study}
          asset={asset}
          isOpen={showUploadModal}
          onClose={() => {
            setShowUploadModal(false);
            setEditingContract(null);
          }}
          onSuccess={handleUploadSuccess}
          editingContract={editingContract}
        />
      )}
    </Box>
  );
}
