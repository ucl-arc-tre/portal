import { Study } from "@/openapi";
import StatusBadge from "../ui/StatusBadge";
import { studySignoffWarningRequired } from "../shared/exports";

import styles from "./StudyCardsList.module.css";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { useAuth } from "@/hooks/useAuth";

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
  const { isAdmin, isIGStaff, userData } = useAuth();
  const { studies } = props;
  const username = userData?.username;

  const canManageStudy = (study: Study): boolean => {
    return (
      username !== undefined &&
      (isAdmin ||
        isIGStaff ||
        study.owner_username === username ||
        study.additional_study_admin_usernames.includes(username))
    );
  };

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
                    studySignoffWarningRequired(study.last_signoff, study.has_project) && (
                      <Badge className={styles["signoff-warning-tag"]} cy="study-confirmation-badge">
                        Study Confirmation due
                      </Badge>
                    )}
                </div>
              }
              manageUrl={`/studies/${canManageStudy(study) ? "manage" : "summary"}?studyId=${study.id}`}
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
