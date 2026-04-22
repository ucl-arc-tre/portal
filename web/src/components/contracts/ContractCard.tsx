import Button from "@/components/ui/Button";
import { Contract } from "@/openapi";
import styles from "./ContractCard.module.css";
import { calculateExpiryUrgency, formatDate } from "../shared/exports";
import ExpiryWarning from "../ui/ExpiryWarning";
import router from "next/router";

type ContractCardProps = {
  contract: Contract;
  studyId: string;
};

export default function ContractCard({ studyId, contract }: ContractCardProps) {
  const expiryUrgency = contract.expiry_date ? calculateExpiryUrgency(new Date(contract.expiry_date)) : null;

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

  return (
    <div
      className={`${styles.card} ${expiryUrgency ? `${styles[`card__expiry-urgency--${expiryUrgency.level}`]}` : ""}`}
      data-cy="contract-card"
    >
      <div className={styles.header}>
        <div className={styles.title}>
          <h4>{contract.title}</h4>
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
          <span className={styles.label}>Uploaded: </span>
          <span className={styles.value}>{formatDate(contract.created_at)}</span>
        </div>

        <div className={styles["detail-item"]}>
          <span className={styles.label}>No. Linked Assets: </span>
          <span className={styles.value}>{contract.asset_ids.length || 0}</span>
        </div>
      </div>

      <div className={styles.actions}>
        {expiryUrgency && <ExpiryWarning expiryUrgency={expiryUrgency} entityName="contract" />}
        <div className={styles["button-wrapper"]}>
          <Button
            onClick={() => {
              router.push(`/contracts/manage?studyId=${studyId}&contractId=${contract.id}`);
            }}
            size="small"
            data-cy="manage-contract-button"
          >
            Manage
          </Button>
        </div>
      </div>
    </div>
  );
}
