import { StudyApprovalStatus, StudyFeedbackEntry } from "@/openapi";
import { Alert } from "../../shared/uikitExports";
import styles from "./StudyFeedback.module.css";

type StudyFeedbackProps = {
  feedbackHistory: StudyFeedbackEntry[];
  approvalStatus: StudyApprovalStatus;
};

export default function StudyFeedback({ feedbackHistory, approvalStatus }: StudyFeedbackProps) {
  const latestFeedback = feedbackHistory[feedbackHistory.length - 1]?.feedback;

  if (approvalStatus === "Approved" || !latestFeedback) return null;

  return (
    <Alert type="warning" className={styles["feedback-alert"]}>
      <h4>This study has new feedback:</h4>
      <p>{latestFeedback}</p>

      <hr></hr>
      <small>
        <em>Please adjust as appropriate and request another review.</em>
      </small>
    </Alert>
  );
}
