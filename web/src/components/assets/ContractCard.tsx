import { useState } from "react";
import Button from "@/components/ui/Button";
import { getStudiesByStudyIdAssetsByAssetIdContractsByContractIdDownload } from "@/openapi";
import styles from "./ContractCard.module.css";

type Contract = {
  id: string;
  filename: string;
  organisationSignatory: string;
  thirdPartyName: string;
  status: "proposed" | "active" | "expired";
  expiryDate: string;
  uploadedAt: string;
};

type ContractCardProps = {
  contract: Contract;
  studyId: string;
  assetId: string;
};

export default function ContractCard({ contract, studyId, assetId }: ContractCardProps) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setDownloading(true);
    setError(null);

    try {
      const response = await getStudiesByStudyIdAssetsByAssetIdContractsByContractIdDownload({
        path: {
          studyId,
          assetId,
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
          <span className={`${styles.status} ${getStatusColor(contract.status)}`}>
            {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
          </span>
        </div>
      </div>

      <div className={styles.details}>
        <div className={styles["detail-item"]}>
          <span className={styles.label}>Organisation Signatory:</span>
          <span className={styles.value}>{contract.organisationSignatory}</span>
        </div>

        <div className={styles["detail-item"]}>
          <span className={styles.label}>Third Party:</span>
          <span className={styles.value}>{contract.thirdPartyName}</span>
        </div>

        <div className={styles["detail-item"]}>
          <span className={styles.label}>Expiry Date:</span>
          <span className={styles.value}>{formatDate(contract.expiryDate)}</span>
        </div>

        <div className={styles["detail-item"]}>
          <span className={styles.label}>Uploaded:</span>
          <span className={styles.value}>{formatDate(contract.uploadedAt)}</span>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <Button onClick={handleDownload} disabled={downloading} size="small" variant="secondary">
          {downloading ? "Downloading..." : "Download PDF"}
        </Button>
      </div>
    </div>
  );
}
