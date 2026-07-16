import { Asset } from "@/openapi";
import styles from "./AssetCard.module.css";
import { Alert, AlertCircleIcon, AlertMessage } from "../shared/uikitExports";
import { useEffect, useState } from "react";
import { calculateExpiryUrgency, formatDate } from "../shared/exports";
import { checkAllRequiredAssetContractsLinked } from "../studies/manage/lib/assetContractLinks";
import ExpiryWarning from "../ui/ExpiryWarning";
import Card from "../ui/Card";
import { calculateRiskScorePerAsset } from "../studies/manage/StudyOverview";
import Badge from "../ui/Badge";

type AssetCardProps = {
  asset: Asset;
  studyId: string;
  involvesNHS?: boolean | null;
  showRiskScore?: boolean;
};

const formatClassification = (classification: string) => {
  return classification.replace(/_/g, " ");
};

const formatProtection = (protection: string | undefined) => {
  return protection?.replace(/_/g, " ");
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
  const { studyId, asset, involvesNHS, showRiskScore = true } = props;
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const expiryUrgency =
    asset.status == "active" && asset.expires_at ? calculateExpiryUrgency(new Date(asset.expires_at)) : null;

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
    <Card
      key={asset.id}
      manageUrl={`/assets/manage?studyId=${studyId}&assetId=${asset.id}`}
      isWarning={!isCompleted || !!expiryUrgency}
      title={asset.title}
      headerContent={
        <>
          <div className={styles["asset-meta"]}>
            <Badge className={getClassificationClass(asset.classification_impact)} cy="asset-classification-badge">
              {formatClassification(asset.classification_impact)}
            </Badge>

            {asset.protection && (
              <Badge className={styles["asset-protection"]} cy="asset-protection-badge">
                {formatProtection(asset.protection)}
              </Badge>
            )}
          </div>
        </>
      }
      footerContent={
        <>
          {expiryUrgency && <ExpiryWarning expiryUrgency={expiryUrgency} entityName="asset" />}

          {!isCompleted && (
            <small className={styles["asset-incomplete__message"]}>
              <AlertCircleIcon className={`${styles["asset-incomplete__icon"]} actions-icon`} />
              This asset requires a contract that has not yet been added. You can manage contracts under the Contracts
              tab.
            </small>
          )}
        </>
      }
    >
      {asset.description && <p className={styles["asset-description"]}>{asset.description}</p>}

      <div className={styles["asset-details"]}>
        {showRiskScore && (
          <div className={styles["asset-detail"]}>
            <span className={styles["asset-detail-label"]}>Risk Score:</span>
            <span className={styles["asset-detail-value"]}>{calculateRiskScorePerAsset(asset, involvesNHS)}</span>
          </div>
        )}
        <div className={styles["asset-detail"]}>
          <span className={styles["asset-detail-label"]}>Tier:</span>
          <span className={styles["asset-detail-value"]}>{asset.tier}</span>
        </div>
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
    </Card>
  );
}
