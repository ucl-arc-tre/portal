import { ApprovalStatus } from "@/openapi";
import InfoTooltip from "./InfoTooltip";
import styles from "./StudyStatusBadge.module.css";

type BadgeProps = {
  status: ApprovalStatus | undefined;
  isAdmin: boolean;
};

export default function StudyStatusBadge({ status, isAdmin }: BadgeProps) {
  function getStatusDescription(status: ApprovalStatus | undefined): string {
    switch (status) {
      case "Incomplete":
        if (isAdmin) {
          return "The study owner has yet to request a review of the study.";
        } else return "Please complete your study setup and request a review.";
      case "Pending":
        if (isAdmin) {
          return "Study is ready for review - either approve or leave feedback to the study owner.";
        } else
          return "Study is under review and awaiting approval from administrators. You can still make changes if necessary.";
      case "Approved":
        return "Study has been approved and is ready for use.";
      case "Rejected":
        return "Study has been rejected. Please review feedback and make necessary changes.";
      default:
        return "Status information not available.";
    }
  }

  return (
    <span className={`${styles["status-badge"]} ${styles[`status-${status?.toLowerCase()}`]}`}>
      {status}
      <span className={styles["tooltip-wrapper"]}>
        <InfoTooltip text={getStatusDescription(status)} />
      </span>
    </span>
  );
}
