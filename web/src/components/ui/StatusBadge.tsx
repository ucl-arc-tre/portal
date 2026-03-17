import { ApprovalStatus } from "@/openapi";
import { useAuth } from "@/hooks/useAuth";
import InfoTooltip from "./InfoTooltip";
import styles from "./StatusBadge.module.css";

type BadgeProps = {
  status: ApprovalStatus | undefined;
  type: "study" | "project";
};

function getDescription(status: ApprovalStatus | undefined, type: "study" | "project", isOpsStaff: boolean): string {
  if (type === "study") {
    switch (status) {
      case "Incomplete":
        return isOpsStaff
          ? "The study owner has yet to complete the study and request a review."
          : "Please complete the required study setup and request a review.";
      case "Pending":
        return isOpsStaff
          ? "This study is ready for review - either approve or leave feedback to the owner."
          : "This study is under review and awaiting approval from an administrator. You can still make changes if necessary.";
      case "Approved":
        return "This study has been approved.";
      case "Rejected":
        return "This study has been rejected. Please review feedback and make necessary changes.";
    }
  } else {
    switch (status) {
      case "Incomplete":
        return isOpsStaff
          ? "The project owner has not yet completed the project setup."
          : "Please complete the required project setup.";
      case "Pending":
        return isOpsStaff
          ? "This project is ready for approval."
          : "This project is awaiting approval from an administrator.";
      case "Approved":
        return "This project has been approved and is awaiting deployment.";
      case "Rejected":
        return "This project has been rejected. Please contact support for more information.";
    }
  }
  return "Status information not available.";
}

export default function StatusBadge(props: BadgeProps) {
  const { status, type } = props;
  const { userData } = useAuth();
  const isOpsStaff = userData?.roles.includes("ig-ops-staff") ?? false;

  const description = getDescription(status, type, isOpsStaff);

  return (
    <span className={`${styles["status-badge"]} ${styles[`status-${status?.toLowerCase()}`]}`} data-cy="status-badge">
      {status}
      <span className={styles["tooltip-wrapper"]}>
        <InfoTooltip text={description} />
      </span>
    </span>
  );
}
