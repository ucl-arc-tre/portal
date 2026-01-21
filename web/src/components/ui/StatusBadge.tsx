import { ApprovalStatus } from "@/openapi";
import InfoTooltip from "./InfoTooltip";
import styles from "./StatusBadge.module.css";

type BadgeProps = {
  status: ApprovalStatus | undefined;
  isOpsStaff: boolean;
  type: "study" | "project";
};

export default function StatusBadge(props: BadgeProps) {
  const { status, isOpsStaff, type } = props;

  function getStudyStatusDescription(status: ApprovalStatus | undefined): string {
    switch (status) {
      case "Incomplete":
        if (isOpsStaff) {
          return "The study owner has yet to complete the study and request a review.";
        } else {
          return "Please complete the required study setup and request a review.";
        }
      case "Pending":
        if (isOpsStaff) {
          return "This study is ready for review - either approve or leave feedback to the owner.";
        } else {
          return "This study is under review and awaiting approval from an administrator. You can still make changes if necessary.";
        }
      case "Approved":
        return "This study has been approved.";
      case "Rejected":
        return "This study has been rejected. Please review feedback and make necessary changes.";
      default:
        return "Status information not available.";
    }
  }

  function getProjectStatusDescription(status: ApprovalStatus | undefined): string {
    switch (status) {
      case "Incomplete":
        if (isOpsStaff) {
          return "The project owner has not yet completed the project setup.";
        } else {
          return "Please complete the required project setup.";
        }
      case "Pending":
        if (isOpsStaff) {
          return "This project is ready for approval.";
        } else {
          return "This project is awaiting approval from an administrator.";
        }
      case "Approved":
        return "This project has been approved and is awaiting deployment.";
      case "Rejected":
        return "This project has been rejected. Please contact support for more information.";
      default:
        return "Status information not available.";
    }
  }

  function getStatusDescription(status: ApprovalStatus | undefined): string {
    return type === "study" ? getStudyStatusDescription(status) : getProjectStatusDescription(status);
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
