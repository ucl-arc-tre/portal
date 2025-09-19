import { useState, useEffect, useCallback } from "react";
import Button from "@/components/ui/Button";
import ContractUploadForm from "./ContractUploadForm";
import ContractCard from "./ContractCard";
import { getStudiesByStudyIdAssetsByAssetIdContracts, Contract } from "@/openapi";
import styles from "./ContractManagement.module.css";

type ContractManagementProps = {
  studyId: string;
  assetId: string;
};

export default function ContractManagement({ studyId, assetId }: ContractManagementProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const fetchContracts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getStudiesByStudyIdAssetsByAssetIdContracts({
        path: { studyId, assetId },
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
  }, [studyId, assetId]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    fetchContracts();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Contract Management</h3>
        <Button onClick={() => setShowUploadModal(true)} variant="primary">
          Add Contract
        </Button>
      </div>

      <p className={styles.description}>
        Manage contract documents for this asset. Upload PDF contracts and track their status.
      </p>

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
          <p>Upload your first contract document to get started.</p>
        </div>
      ) : (
        <div className={styles["contracts-grid"]}>
          {contracts.map((contract) => (
            <ContractCard key={contract.id} contract={contract} studyId={studyId} assetId={assetId} />
          ))}
        </div>
      )}

      <ContractUploadForm
        studyId={studyId}
        assetId={assetId}
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}
