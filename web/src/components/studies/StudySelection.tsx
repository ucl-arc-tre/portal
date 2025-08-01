import Button from "@/components/ui/Button";
import InfoTooltip from "@/components/ui/InfoTooltip";
import { Study } from "@/openapi";
import { useRouter } from "next/router";

import styles from "./StudySelection.module.css";

type StudySelectionProps = {
  studies: Study[];
};

function getStatusDescription(status: string | undefined): string {
  switch (status) {
    case "Incomplete":
      return "Click 'manage study' to complete your study setup.";
    case "Pending":
      return "Study is under review and awaiting approval from administrators.";
    case "Approved":
      return "Study has been approved and is ready for use.";
    case "Rejected":
      return "Study has been rejected. Please review feedback and make necessary changes.";
    default:
      return "Status information not available.";
  }
}

export default function StudySelection(props: StudySelectionProps) {
  const { studies } = props;
  const router = useRouter();

  return (
    <div className={styles["study-selection"]}>
      <h2 className={styles["studies-heading"]}>Your Studies</h2>

      <div className={styles["studies-list"]}>
        {studies.map((study) => (
          <div key={study.id} className={styles["study-card"]}>
            <div className={styles["status-indicator"]}>
              <span className={`${styles["status-badge"]} ${styles[`status-${study.approval_status?.toLowerCase()}`]}`}>
                {study.approval_status}
                <span className={styles["tooltip-wrapper"]}>
                  <InfoTooltip text={getStatusDescription(study.approval_status)} />
                </span>
              </span>
            </div>

            <div className={styles["study-info"]}>
              <h3 className={styles["study-title"]}>{study.title}</h3>
              <p className={styles["study-description"]}>{study.description}</p>
            </div>

            <div className={styles["study-actions"]}>
              <Button onClick={() => router.push(`/studies/${study.id}/manage`)} size="small">
                Manage Study
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
