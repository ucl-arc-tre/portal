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
  switch (environment) {
    case "ARC Trusted Research Environment":
      switch (status) {
        case "incomplete":
          return isOpsStaff
            ? "The project owner has not yet completed the project setup."
            : "Please complete the required project setup.";
        case "pending-approval":
          return isOpsStaff
            ? "This project is ready for approval."
            : "This project is awaiting approval from an administrator.";
        case "pending-creation":
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

function getDescription(
  type: "study" | "project",
  status: string | undefined,
  environment: EnvironmentName | undefined,
  isOpsStaff: boolean
): string {
  switch (type) {
    case "study":
      return getStudyDescription(status as StudyApprovalStatus, isOpsStaff);
    case "project":
      return getProjectTREDescription(status, environment, isOpsStaff);
  }
}

function getStatusClassName(status: string | undefined): string {
  status = status?.toLowerCase() || "";
  if (status.includes("pending")) {
    return styles["status-pending"];
  } else if (status.includes("incomplete")) {
    return styles["status-incomplete"];
  } else if (status.includes("approve") || status.includes("deploy")) {
    return styles["status-approved"];
  } else if (status.includes("reject")) {
    return styles["status-rejected"];
  } else if (status.includes("delete")) {
    return styles["status-deleted"];
  }
  return "";
}

export default function StatusBadge(props: BadgeProps) {
  const { status, type, environment } = props;
  const { userData } = useAuth();
  const isOpsStaff = userData?.roles.includes("ig-ops-staff") ?? false;

  const description = getDescription(type, status, environment, isOpsStaff);
  return (
    <span className={`${styles["status-badge"]} ${getStatusClassName(status)}`} data-cy="status-badge">
      {status}
      <span className={styles["tooltip-wrapper"]}>
        <InfoTooltip text={description} />
      </span>
    </span>
  );
}
