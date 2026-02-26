import { useState, useEffect, useCallback } from "react";
import Button from "@/components/ui/Button";
import ContractUploadForm from "./ContractUploadForm";
import ContractCard from "./ContractCard";
import { getStudiesByStudyIdContracts, Contract, Study } from "@/openapi";
import { extractErrorMessage } from "@/lib/errorHandler";
import styles from "./ContractManagement.module.css";
import Box from "@/components/ui/Box";
import { AlertMessage, Alert, calculateExpiryUrgency } from "../shared/exports";

type ContractManagementProps = {
  study: Study;
  canModify: boolean;
  setNumContracts: (numContracts: number) => void;
  assetContractsCompleted: boolean;
  setContractsNeedAttention: (needsAttention: boolean) => void;
};

export default function ContractManagement(props: ContractManagementProps) {
  const { study, canModify, setNumContracts, assetContractsCompleted, setContractsNeedAttention } = props;
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);

  const fetchContracts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getStudiesByStudyIdContracts({
        path: { studyId: study.id },
      });

      if (!response.response.ok || !response.data) {
        const errorMsg = extractErrorMessage(response);
        setError(`Failed to load contracts: ${errorMsg}`);
        return;
      }
      setContracts(response.data);
      setNumContracts(response.data.length);
      if (response.data.length > 0) {
        const needsAttention =
          response.data.some((contract) => {
            const expiryUrgency = calculateExpiryUrgency(new Date(contract.expiry_date));
            return expiryUrgency && (expiryUrgency.level === "medium" || expiryUrgency.level === "high");
          }) || false;
        setContractsNeedAttention(needsAttention);
      }
    } catch (err) {
      console.error("Failed to load contracts:", err);
      setError("Failed to load contracts. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [study.id, setNumContracts, setContractsNeedAttention]);

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
            Manage contract documents for this study. Upload PDF contracts and track their status.
          </p>
        </>
      ) : (
        <div className={styles.header}>
          <h3>Contracts</h3>
        </div>
      )}

      {contracts.length === 0 &&
        (!assetContractsCompleted || study.involves_external_users || study.involves_third_party) && (
          <div className={styles["contract-requirement-notice"]}>
            <div>
              Based on your responses while making your Study and Asset, uploading a contract is required. This is
              because you said:
              <ul>
                {!assetContractsCompleted && <li>An asset in this study requires a contract.</li>}
                {study.involves_external_users && <li>Your study involves external users.</li>}
                {study.involves_third_party && <li>Your study involves third parties.</li>}
              </ul>
              <p>Please ensure you upload a valid contract document to comply with our policies.</p>
            </div>
          </div>
        )}

      {error && (
        <Alert type="error">
          <AlertMessage>{error}</AlertMessage>
        </Alert>
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
              onEdit={() => handleEditContract(contract)}
              canModify={canModify}
            />
          ))}
        </div>
      )}

      {canModify && showUploadModal && (
        <ContractUploadForm
          study={study}
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
