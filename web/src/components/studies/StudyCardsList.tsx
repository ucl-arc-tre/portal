import { useRouter } from "next/router";
import { Study } from "@/openapi";
import StudyStatusBadge from "../ui/StatusBadge";
import Button from "@/components/ui/Button";

import styles from "./StudyCardsList.module.css";

type Props = {
  studies: Study[];
  isIGOpsStaff: boolean;
  canSeeAll: boolean;
};

const studySortOrder = {
  Pending: 1,
  Incomplete: 2,
  Rejected: 3,
  Approved: 4,
};

export default function StudyCardsList(props: Props) {
  const { studies, isIGOpsStaff, canSeeAll } = props;
  const router = useRouter();

  return (
    <div className={styles["study-selection"]}>
      {!canSeeAll && <h2 className={styles["studies-heading"]}>Your Studies</h2>}

      <div className={styles["studies-list"]}>
        {studies
          .sort((a, b) => studySortOrder[a.approval_status] - studySortOrder[b.approval_status])
          .map((study) => (
            <div key={study.id} className={styles["study-card"]} data-cy="study-card">
              <div className={styles["status-indicator"]}>
                <StudyStatusBadge status={study.approval_status} isOpsStaff={isIGOpsStaff} type="study" />
              </div>

              <div className={styles["study-info"]}>
                <h3 className={styles["study-title"]}>{study.title}</h3>
                <p className={styles["study-description"]}>{study.description}</p>
              </div>

              <div className={styles["study-actions"]}>
                <Button
                  onClick={() => router.push(`/studies/manage?studyId=${study.id}`)}
                  size="small"
                  data-cy="manage-study-button"
                >
                  {isIGOpsStaff ? "View Study" : "Manage Study"}
                </Button>
                {!isIGOpsStaff && study.approval_status === "Approved" && (
                  <Button onClick={() => router.push("/projects")} size="small" variant="secondary">
                    Create Project
                  </Button>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
