import {
  deleteStudiesByStudyIdContractsByContractIdObjectsByContractObjectId,
  getStudiesByStudyIdContractsByContractIdObjectsByContractObjectId,
} from "@/openapi";
import { Alert, AlertMessage } from "../shared/uikitExports";
import Button from "../ui/Button";
import ConfirmDeleteModal from "../ui/ConfirmDeleteModal";
import styles from "./ContractObjectCard.module.css";
import { useState } from "react";
import { extractErrorMessage } from "@/lib/errorHandler";

type ContractObjectCardProps = {
  studyId: string;
  contractId: string;
  filename: string;
  id: string;
  createdAt: string;
  canModify: boolean;
};

export default function ContractObjectCard(props: ContractObjectCardProps) {
  const { id, contractId, studyId, filename, createdAt, canModify } = props;

  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    setError(null);

    try {
      const response = await getStudiesByStudyIdContractsByContractIdObjectsByContractObjectId({
        path: {
          studyId,
          contractId: contractId,
          contractObjectId: id,
        },
      });

      if (!response.response.ok || !response.data) {
        const errorMsg = extractErrorMessage(response);
        setError(`Download failed: ${errorMsg}`);
        return;
      }

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      setError("Failed to download contract. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    const response = await deleteStudiesByStudyIdContractsByContractIdObjectsByContractObjectId({
      path: {
        studyId,
        contractId: contractId,
        contractObjectId: id,
      },
    });

    setIsDeleting(false);

    if (!response.response.ok) {
      const errorMsg = extractErrorMessage(response);
      setError(`Delete failed: ${errorMsg}`);
      return;
    }
    setIsDeleted(true);
  };

  if (isDeleted) return null;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h4>{filename}</h4>
      </div>

      <div className={styles.details}>
        <div className={styles["detail-item"]}>
          <span className={styles.label}>Created at: </span>
          <span className={styles.value}>{createdAt}</span>
        </div>
      </div>

      <div className={styles["button-wrapper"]}>
        <Button
          className={styles["download-button"]}
          onClick={handleDownload}
          disabled={downloading}
          size="small"
          variant="secondary"
          cy="contract-object-download-button"
        >
          {downloading ? "Downloading..." : "Download"}
        </Button>

        {canModify && (
          <Button
            className="delete-button"
            onClick={() => setShowDeleteModal(true)}
            size="small"
            data-cy="delete-contract-button"
            cy="contract-object-delete-button"
          >
            Delete File
          </Button>
        )}
      </div>

      {error && (
        <Alert type="error">
          <AlertMessage>{error}</AlertMessage>
        </Alert>
      )}

      {showDeleteModal && (
        <ConfirmDeleteModal
          title="Delete File"
          message="Are you sure you want to delete this file? This operation cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          isDeleting={isDeleting}
          error={error}
        />
      )}
    </div>
  );
}
