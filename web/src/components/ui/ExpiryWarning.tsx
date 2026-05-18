import { AlertCircleIcon } from "../shared/uikitExports";
import styles from "./ExpiryWarning.module.css";
type ExpiryWarningProps = {
  expiryUrgency: ExpiryUrgency;
  entityName: string;
};

export default function ExpiryWarning({ expiryUrgency, entityName }: ExpiryWarningProps) {
  return (
    <small className={styles["expiry-warning"]}>
      <AlertCircleIcon className={`expiry-urgency--${expiryUrgency.level} actions-icon`} />
      {expiryUrgency.level === "critical"
        ? `This ${entityName} has expired, please review and update as soon as possible`
        : `This ${entityName} is expiring soon, please review and update if necessary`}
    </small>
  );
}
