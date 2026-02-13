import { useState } from "react";
import Button from "@/components/ui/Button";
import { Contract, getStudiesByStudyIdContractsByContractIdDownload } from "@/openapi";
import styles from "./ContractCard.module.css";

type ContractCardProps = {
  contract: Contract;
  studyId: string;
  onEdit: () => void;
  canModify: boolean;
};

export default function ContractCard({ contract, studyId, onEdit, canModify }: ContractCardProps) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setDownloading(true);
    setError(null);

    try {
      const response = await getStudiesByStudyIdContractsByContractIdDownload({
        path: {
          studyId,
          contractId: contract.id,
        },
      });

      if (!response.response.ok || !response.data) {
        throw new Error(`Download failed: ${response.response.status} ${response.response.statusText}`);
      }

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = contract.filename || "contract.pdf";
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return styles["status-active"];
      case "proposed":
        return styles["status-proposed"];
      case "expired":
        return styles["status-expired"];
      default:
        return styles["status-default"];
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles["file-info"]}>
          <h4 className={styles.filename}>{contract.filename}</h4>
        </div>
        <span className={`${styles.status} ${getStatusColor(contract.status)}`}>
          {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
        </span>
      </div>

      <div className={styles.details}>
        <div className={styles["detail-item"]}>
          <span className={styles.label}>Organisation Signatory: </span>
          <span className={styles.value}>{contract.organisation_signatory}</span>
        </div>

        <div className={styles["detail-item"]}>
          <span className={styles.label}>Third Party: </span>
          <span className={styles.value}>{contract.third_party_name}</span>
        </div>

        <div className={styles["detail-item"]}>
          <span className={styles.label}>Expiry Date: </span>
          <span className={styles.value}>{formatDate(contract.expiry_date)}</span>
        </div>

        <div className={styles["detail-item"]}>
          <span className={styles.label}>Uploaded: </span>
          <span className={styles.value}>{formatDate(contract.created_at)}</span>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <Button onClick={handleDownload} disabled={downloading} size="small" variant="secondary">
          {downloading ? "Downloading..." : "Download PDF"}
        </Button>

        {canModify && (
          <Button onClick={onEdit} size="small" data-cy="edit-contract-button">
            Edit
          </Button>
        )}
      </div>
    </div>
  );
}
