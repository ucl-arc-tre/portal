import { Asset } from "@/openapi";
import Button from "@/components/ui/Button";
import { useRouter } from "next/router";
import styles from "./AssetCard.module.css";
import { Alert, AlertCircleIcon, AlertMessage } from "../shared/uikitExports";
import { useEffect, useState } from "react";
import { calculateExpiryUrgency, formatDate } from "../shared/exports";
import { checkAllRequiredAssetContractsLinked } from "../studies/manage/lib/assetContractLinks";
import ExpiryWarning from "../ui/ExpiryWarning";

type AssetCardProps = {
  asset: Asset;
  studyId: string;
  canModify: boolean;
};

const formatClassification = (classification: string) => {
  return classification.replace(/_/g, " ");
};

const formatProtection = (protection: string) => {
  return protection.replace(/_/g, " ");
};

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

export default function AssetCard(props: AssetCardProps) {
  const { studyId, asset, canModify } = props;
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const expiryUrgency = asset.expires_at ? calculateExpiryUrgency(new Date(asset.expires_at)) : null;

  useEffect(() => {
    const isAssetCompleted = async () => {
      try {
        const response = await checkAllRequiredAssetContractsLinked([asset], studyId);
        setIsCompleted(response);
      } catch (err) {
        console.error("Failed to check asset completion:", err);
        setError("Failed to check contract status.");
      }
    };
    isAssetCompleted();
  }, [asset.id, asset.requires_contract, asset.contract_ids, studyId]);

  return (
    <div data-cy="asset-card" className={`${styles["asset-card"]} ${!isCompleted ? styles["asset-incomplete"] : ""}`}>
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

        <div className={styles["asset-detail"]}>
          <span className={styles["asset-detail-label"]}>No. Linked Contracts:</span>
          <span className={styles["asset-detail-value"]}>{asset.contract_ids.length}</span>
        </div>
      </div>

      {error && (
        <Alert type="error">
          <AlertMessage>{error}</AlertMessage>
        </Alert>
      )}

      <div className={styles["asset-actions"]}>
        {expiryUrgency && <ExpiryWarning expiryUrgency={expiryUrgency} entityName="asset" />}

        {!isCompleted && (
          <>
            <small className={styles["asset-incomplete__message"]}>
              <AlertCircleIcon className={`${styles["asset-incomplete__icon"]} actions-icon`} />
              This asset requires a contract that has not yet been added. You can manage contracts under the Contracts
              tab.
            </small>
            <Button
              onClick={() => {
                router.push({ query: { ...router.query, tab: "contracts" } }, undefined, { shallow: true });
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              variant="secondary"
              size="small"
            >
              Contracts
            </Button>
          </>
        )}

        <Button onClick={() => router.push(`/assets/manage?studyId=${studyId}&assetId=${asset.id}`)} size="small">
          {canModify ? "Manage" : "View"}
        </Button>
      </div>
    </div>
  );
}
