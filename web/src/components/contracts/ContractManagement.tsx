import { useState } from "react";
import Button from "@/components/ui/Button";
import ContractUploadForm from "./ContractUploadForm";
import ContractCard from "./ContractCard";
import { Contract, Study } from "@/openapi";
import styles from "./ContractManagement.module.css";
import Box from "@/components/ui/Box";
import { Alert, AlertMessage } from "@/components/shared/uikitExports";

type ContractManagementProps = {
  study: Study;
  contracts: Contract[];
  canModify: boolean;
  someAssetsRequireContracts: boolean;
  fetchStudyContents: () => Promise<void>;
};

export default function ContractManagement(props: ContractManagementProps) {
  const { study, contracts, canModify, someAssetsRequireContracts, fetchStudyContents } = props;
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    fetchStudyContents();
  };

  return (
    <Box>
      {canModify ? (
        <>
          <div className={styles.header}>
            <h3>Contract Management</h3>
            <Button onClick={() => setShowUploadModal(true)} variant="primary" cy="add-contract">
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
        (someAssetsRequireContracts || study.involves_external_users || study.involves_third_party) && (
          <Alert type="warning">
            <AlertMessage>
              Based on your responses while making your Study and Asset, uploading a contract is required. This is
              because you said:
              <ul>
                {someAssetsRequireContracts && <li>An asset in this study requires a contract.</li>}
                {study.involves_external_users && <li>Your study involves external users.</li>}
                {study.involves_third_party && <li>Your study involves third parties.</li>}
              </ul>
              Please ensure you upload a valid contract document to comply with our policies.
            </AlertMessage>
          </Alert>
        )}

      {contracts.length === 0 ? (
        <div className={styles["empty-state"]}>
          <h4>No contracts uploaded</h4>
          {canModify && <p>Upload your first contract document to get started.</p>}
        </div>
      ) : (
        <div className={styles["contracts-list"]}>
          {contracts.map((contract) => (
            <ContractCard key={contract.id} contract={contract} studyId={study.id} canModify={canModify} />
          ))}
        </div>
      )}

      {canModify && showUploadModal && (
        <ContractUploadForm
          study={study}
          onClose={() => {
            setShowUploadModal(false);
          }}
          onSuccess={handleUploadSuccess}
          editingContract={null}
        />
      )}
    </Box>
  );
}
