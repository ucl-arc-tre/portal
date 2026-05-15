import { EnvironmentName, StudyApprovalStatus } from "@/openapi";
import { useAuth } from "@/hooks/useAuth";
import InfoTooltip from "./InfoTooltip";
import styles from "./StatusBadge.module.css";

type BadgeProps = {
  status: StudyApprovalStatus | string | undefined;
  type: "study" | "project";
  environment?: EnvironmentName;
};

function getStudyDescription(status: StudyApprovalStatus | undefined, isOpsStaff: boolean): string {
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

  return "Status information not available.";
}

function getProjectTREDescription(
  status: string | undefined,
  environment: EnvironmentName | undefined,
  isOpsStaff: boolean
): string {
  console.log(status);
  switch (environment) {
    case "ARC Trusted Research Environment":
      switch (status) {
        case "incomplete":
          return isOpsStaff
            ? "The project owner has not yet completed the project setup."
            : "Please complete the required project setup.";
        case "pending-creation":
          return isOpsStaff
            ? "This project is ready for approval."
            : "This project is awaiting approval from an administrator.";
        case "approved":
          return "This project has been approved and is awaiting deployment.";
        case "deployed":
          return "This project has been approved and deployed.";
        case "pending-deletion":
          return "This project has been requested for deletion.";
        case "deleted":
          return "This project has been deleted.";
      }
  }

  return "Status information not available.";
}

export default function StatusBadge(props: BadgeProps) {
  const { status, type, environment } = props;
  const { userData } = useAuth();
  const isOpsStaff = userData?.roles.includes("ig-ops-staff") ?? false;

  let description;
  switch (type) {
    case "study":
      description = getStudyDescription(status as StudyApprovalStatus, isOpsStaff);
    case "project":
      description = getProjectTREDescription(status, environment, isOpsStaff);
  }

  return (
    <span className={`${styles["status-badge"]} ${styles[`status-${status?.toLowerCase()}`]}`} data-cy="status-badge">
      {status}
      <span className={styles["tooltip-wrapper"]}>
        <InfoTooltip text={description} />
      </span>
    </span>
  );
}
