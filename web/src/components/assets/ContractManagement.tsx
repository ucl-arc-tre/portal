import { useState } from "react";
import Button from "@/components/ui/Button";
import ContractUploadForm from "./ContractUploadForm";
import ContractCard from "./ContractCard";
import styles from "./ContractManagement.module.css";

type ContractManagementProps = {
  studyId: string;
  assetId: string;
};

type Contract = {
  id: string;
  filename: string;
  organisationSignatory: string;
  thirdPartyName: string;
  status: "proposed" | "active" | "expired";
  expiryDate: string;
  uploadedAt: string;
};

export default function ContractManagement({ studyId, assetId }: ContractManagementProps) {
  const [contracts, setContracts] = useState<Contract[]>([
    // Mock data for testing - replace with actual API call
    {
      id: "1",
      filename: "Data_Processing_Agreement.pdf",
      organisationSignatory: "Dr. Jane Smith",
      thirdPartyName: "Research Partners Ltd",
      status: "active",
      expiryDate: "2024-12-31",
      uploadedAt: "2024-01-15",
    },
    {
      id: "2",
      filename: "Collaboration_Contract.pdf",
      organisationSignatory: "Prof. John Doe",
      thirdPartyName: "University Hospital",
      status: "proposed",
      expiryDate: "2025-06-30",
      uploadedAt: "2024-02-20",
    },
  ]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleUploadSuccess = () => {
    // TODO: Refresh contracts list from API
    // For now, just close the modal
    setShowUploadModal(false);
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

      {contracts.length === 0 ? (
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
