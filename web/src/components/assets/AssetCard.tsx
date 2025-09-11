import { Asset } from "@/openapi";
import Button from "@/components/ui/Button";
import { useRouter } from "next/router";
import styles from "./AssetCard.module.css";

type AssetCardProps = {
  asset: Asset;
  studyId: string;
  studyTitle: string;
};

const formatClassification = (classification: string) => {
  return classification.replace(/_/g, " ");
};

const formatProtection = (protection: string) => {
  return protection.replace(/_/g, " ");
};

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

export default function AssetCard({ studyId, studyTitle, asset }: AssetCardProps) {
  const router = useRouter();

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
    <div className={styles["asset-card"]}>
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

      <div className={styles["asset-actions"]}>
        <Button onClick={() => router.push(`/studies/${studyId}/assets/${asset.id}/manage`)} size="small">
          Manage Asset
        </Button>
      </div>
    </div>
  );
}
