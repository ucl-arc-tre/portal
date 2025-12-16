import { ApprovalStatus } from "@/openapi";
import InfoTooltip from "./InfoTooltip";
import styles from "./StatusBadge.module.css";

type BadgeProps = {
  status: ApprovalStatus | undefined;
  isOpsStaff: boolean;
};

export default function StatusBadge(props: BadgeProps) {
  const { status, isOpsStaff } = props;
  function getStatusDescription(status: ApprovalStatus | undefined): string {
    switch (status) {
      case "Incomplete":
        if (isOpsStaff) {
          return "The owner has yet to request a review.";
        } else return "Please complete the required setup and request a review.";
      case "Pending":
        if (isOpsStaff) {
          return "Ready for review - either approve or leave feedback to the owner.";
        } else
          return "Under review and awaiting approval from administrators. You can still make changes if necessary.";
      case "Approved":
        return "Approved and ready for use.";
      case "Rejected":
        return "Rejected. Please review feedback and make necessary changes.";
      default:
        return "Status information not available.";
    }
  }

  return (
    <span className={`${styles["status-badge"]} ${styles[`status-${status?.toLowerCase()}`]}`} data-cy="status-badge">
      {status}
      <span className={styles["tooltip-wrapper"]}>
        <InfoTooltip text={getStatusDescription(status)} />
      </span>
    </span>
  );
}
