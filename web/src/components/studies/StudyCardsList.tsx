import { Study } from "@/openapi";
import StatusBadge from "../ui/StatusBadge";
import { studySignoffWarningRequired } from "../shared/exports";

import styles from "./StudyCardsList.module.css";
import Card from "../ui/Card";
import Badge from "../ui/Badge";

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

  return (
    <div className={styles["study-selection"]}>
      <div className={styles["studies-list"]}>
        {studies
          .slice()
          .sort((a, b) => studySortOrder[a.approval_status] - studySortOrder[b.approval_status])
          .map((study) => (
            <Card
              key={study.id}
              title={study.title}
              headerContent={
                <div className={styles["status-indicator"]}>
                  <StatusBadge status={study.approval_status} type="study" />
                  {study.approval_status === "Approved" &&
                    study.last_signoff != null &&
                    studySignoffWarningRequired(study.last_signoff) && (
                      <Badge className={styles["signoff-warning-tag"]} cy="study-confirmation-badge">
                        Study Confirmation due
                      </Badge>
                    )}
                </div>
              }
              manageUrl={`/studies/manage?studyId=${study.id}`}
            >
              <div className={styles["study-info"]}>
                <span className={styles["study-caseref"]}>Case ref: {String(study.caseref).padStart(5, "0")}</span>
                <p className={styles["study-description"]}>{study.description}</p>
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
}
