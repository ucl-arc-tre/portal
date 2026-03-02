import { Asset } from "@/openapi";
import Button from "@/components/ui/Button";
import { useRouter } from "next/router";
import styles from "./AssetCard.module.css";
import { Alert, AlertCircleIcon, AlertMessage } from "../shared/uikitExports";
import { useEffect, useState } from "react";
import { formatDate } from "../shared/exports";

type AssetCardProps = {
  asset: Asset;
  studyId: string;
  checkCompleted: (assets: Asset[]) => Promise<boolean>;
  canModify: boolean;
  setTab?: (tab: string) => void;
};

const formatClassification = (classification: string) => {
  return classification.replace(/_/g, " ");
};

const formatProtection = (protection: string) => {
  return protection.replace(/_/g, " ");
};

export default function AssetCard(props: AssetCardProps) {
  const { studyId, asset, checkCompleted, canModify, setTab } = props;
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const isAssetCompleted = async () => {
      try {
        const response = await checkCompleted([asset]);
        setIsCompleted(response);
      } catch (err) {
        console.error("Failed to check asset completion:", err);
        setError("Failed to check contract status.");
      }
    };
    isAssetCompleted();
  });

  const getClassificationClass = (classification: string) => {
    switch (classification) {
      case "public":
        return styles["asset-classification-public"];
      case "confidential":
        return styles["asset-classification-confidential"];
      case "highly_confidential":
        return styles["asset-classification-highly-confidential"];
      default:
        return styles["asset-classification-public"];
    }
  };

  return (
    <div className={`${styles["asset-card"]} ${!isCompleted ? styles["asset-incomplete"] : ""}`}>
      <div className={styles["asset-header"]}>
        <h4 className={styles["asset-title"]}>{asset.title}</h4>
        <div className={styles["asset-meta"]}>
          <span className={`${styles["asset-badge"]} ${getClassificationClass(asset.classification_impact)}`}>
            {formatClassification(asset.classification_impact)}
          </span>
          <span className={`${styles["asset-badge"]} ${styles["asset-protection"]}`}>
            {formatProtection(asset.protection)}
          </span>
        </div>
      </div>

      {asset.description && <p className={styles["asset-description"]}>{asset.description}</p>}

      <div className={styles["asset-details"]}>
        {asset.locations && asset.locations.length > 0 && (
          <div className={styles["asset-detail"]}>
            <span className={styles["asset-detail-label"]}>Storage Locations:</span>
            <div className={styles["asset-locations"]}>
              {asset.locations.map((location, index) => (
                <span key={index} className={styles["asset-location"]}>
                  {location}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className={styles["asset-detail"]}>
          <span className={styles["asset-detail-label"]}>Created:</span>
          <span className={styles["asset-detail-value"]}>{formatDate(asset.created_at)}</span>
        </div>

        {asset.updated_at !== asset.created_at && (
          <div className={styles["asset-detail"]}>
            <span className={styles["asset-detail-label"]}>Last Updated:</span>
            <span className={styles["asset-detail-value"]}>{formatDate(asset.updated_at)}</span>
          </div>
        )}
      </div>

      {error && (
        <Alert type="error">
          <AlertMessage>{error}</AlertMessage>
        </Alert>
      )}

      <div className={styles["asset-actions"]}>
        {!isCompleted && (
          <>
            <small className={styles["asset-incomplete__message"]}>
              <AlertCircleIcon className={`${styles["asset-incomplete__icon"]} actions-icon`} />
              This asset requires a contract that has not yet been added. You can manage contracts under the Contracts
              tab.
            </small>
            {setTab && (
              <Button
                onClick={() => {
                  setTab("contracts");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                variant="secondary"
                size="small"
              >
                Contracts{" "}
              </Button>
            )}
          </>
        )}
        <Button onClick={() => router.push(`/assets/manage?studyId=${studyId}&assetId=${asset.id}`)} size="small">
          {canModify ? "Manage Asset" : "View Asset"}
        </Button>
      </div>
    </div>
  );
}
