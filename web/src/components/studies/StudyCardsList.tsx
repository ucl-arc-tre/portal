import { useRouter } from "next/router";
import { Study } from "@/openapi";
import StatusBadge from "../ui/StatusBadge";
import Button from "@/components/ui/Button";

import styles from "./StudyCardsList.module.css";

type Props = {
  studies: Study[];
};

const studySortOrder = {
  Pending: 1,
  Incomplete: 2,
  Rejected: 3,
  Approved: 4,
};

export default function StudyCardsList(props: Props) {
  const { studies } = props;
  const router = useRouter();

  return (
    <div className={styles["study-selection"]}>
      <div className={styles["studies-list"]}>
        {studies
          .slice()
          .sort((a, b) => studySortOrder[a.approval_status] - studySortOrder[b.approval_status])
          .map((study) => (
            <div key={study.id} className={styles["study-card"]} data-cy="study-card">
              <div className={styles["status-indicator"]}>
                <StatusBadge status={study.approval_status} type="study" />
              </div>

              <div className={styles["study-info"]}>
                <h3 className={styles["study-title"]}>{study.title}</h3>
                <span className={styles["study-caseref"]}>Case ref: {String(study.caseref).padStart(5, "0")}</span>
                <p className={styles["study-description"]}>{study.description}</p>
              </div>

              <div className={styles["study-actions"]}>
                <Button
                  onClick={() => router.push(`/studies/manage?studyId=${study.id}`)}
                  size="small"
                  data-cy="manage-study-button"
                >
                  Manage Study
                </Button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
