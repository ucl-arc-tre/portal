import { Contract } from "@/openapi";
import styles from "./ContractCard.module.css";
import { calculateExpiryUrgency, formatDate } from "../shared/exports";
import ExpiryWarning from "../ui/ExpiryWarning";
import Card from "../ui/Card";

type ContractCardProps = {
  contract: Contract;
  studyId: string;
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return styles["status-active"];
    case "proposed":
      return styles["status-proposed"];
    case "expired":
      return styles["status-expired"];
    case "closed":
      return styles["status-closed"];
    default:
      return styles["status-default"];
  }
};
export default function ContractCard({ studyId, contract }: ContractCardProps) {
  const expiryUrgency = contract.expiry_date ? calculateExpiryUrgency(new Date(contract.expiry_date)) : null;

  return (
    <Card
      key={contract.id}
      title={contract.title}
      headerContent={
        <div className={styles["status-indicator"]}>
          <span className={`${styles.status} ${getStatusColor(contract.status)}`}>
            {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
          </span>
        </div>
      }
      manageUrl={`/contracts/manage?studyId=${studyId}&contractId=${contract.id}`}
      isWarning={!!expiryUrgency && contract.status !== "closed"}
      footerContent={
        contract.status !== "closed" &&
        expiryUrgency && <ExpiryWarning expiryUrgency={expiryUrgency} entityName="contract" />
      }
    >
      <div className={styles.details}>
        <div className={styles["detail-item"]}>
          <span className={styles.label}>Organisation Signatory: </span>
          <span className={styles.value}>{contract.organisation_signatory}</span>
        </div>

        <div className={styles["detail-item"]}>
          <span className={styles.label}>Third Party: </span>
          <span className={styles.value}>{contract.third_party_name}</span>
        </div>

        {contract.other_signatories && (
          <div className={styles["detail-item"]}>
            <span className={styles.label}>Other Signatories: </span>
            <span className={styles.value}>{contract.other_signatories}</span>
          </div>
        )}

        <div className={styles["detail-item"]}>
          <span className={styles.label}>Expiry Date: </span>
          <span className={styles.value}>{contract.expiry_date ? formatDate(contract.expiry_date) : "None"}</span>
        </div>
        <div className={styles["detail-item"]}>
          <span className={styles.label}>Retention End Date: </span>
          <span className={styles.value}>
            {contract.retention_end_date ? formatDate(contract.retention_end_date) : "None"}
          </span>
        </div>

        <div className={styles["detail-item"]}>
          <span className={styles.label}>Uploaded: </span>
          <span className={styles.value}>{formatDate(contract.created_at)}</span>
        </div>

        <div className={styles["detail-item"]}>
          <span className={styles.label}>No. Linked Assets: </span>
          <span className={styles.value}>{contract.asset_ids.length || 0}</span>
        </div>
      </div>
    </Card>
  );
}
