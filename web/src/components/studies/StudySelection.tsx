import Button from "@/components/ui/Button";
import { Study } from "@/openapi";
import { useRouter } from "next/router";

import styles from "./StudySelection.module.css";
import StudyStatusBadge from "../ui/StudyStatusBadge";

type StudySelectionProps = {
  studies: Study[];
  isAdmin: boolean;
};

export default function StudySelection(props: StudySelectionProps) {
  const { studies, isAdmin } = props;
  const router = useRouter();

  const studySortOrder = {
    Pending: 1,
    Incomplete: 2,
    Rejected: 3,
    Approved: 4,
  };

  if (studies.length === 0) {
    return (
      <div className={styles["study-selection"]}>
        <div className={styles["studies-list"]}>
          <p>No studies found</p>;
        </div>
      </div>
    );
  }

  return (
    <div className={styles["study-selection"]}>
      {!isAdmin && <h2 className={styles["studies-heading"]}>Your Studies</h2>}

      <div className={styles["studies-list"]}>
        {studies
          .sort((a, b) => studySortOrder[a.approval_status] - studySortOrder[b.approval_status])
          .map((study) => (
            <div key={study.id} className={styles["study-card"]}>
              <div className={styles["status-indicator"]}>
                <StudyStatusBadge status={study.approval_status} isAdmin={isAdmin} />
              </div>

              <div className={styles["study-info"]}>
                <h3 className={styles["study-title"]}>{study.title}</h3>
                <p className={styles["study-description"]}>{study.description}</p>
              </div>

              <div className={styles["study-actions"]}>
                <Button onClick={() => router.push(`/studies/manage?studyId=${study.id}`)} size="small">
                  {isAdmin ? "View Study" : "Manage Study"}
                </Button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
