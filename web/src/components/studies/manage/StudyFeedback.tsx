import { useState } from "react";
import { StudyApprovalStatus, StudyFeedbackEntry } from "@/openapi";
import { Alert } from "../../shared/uikitExports";
import Button from "../../ui/Button";
import Dialog from "../../ui/Dialog";
import styles from "./StudyFeedback.module.css";

type StudyFeedbackProps = {
  feedbackHistory: StudyFeedbackEntry[];
  approvalStatus: StudyApprovalStatus;
};

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// The "Rejected" approval status is displayed as "Updates Requested" - matches StatusBadge
function displayStatus(status: StudyApprovalStatus) {
  return status === "Rejected" ? "Updates Requested" : status;
}

export default function StudyFeedback({ feedbackHistory, approvalStatus }: StudyFeedbackProps) {
  const [historyOpen, setHistoryOpen] = useState(false);

  if (feedbackHistory.length === 0) return null;

  const latestFeedback = feedbackHistory[feedbackHistory.length - 1]?.feedback;
  const newestFirst = [...feedbackHistory].reverse();

  return (
    <div>
      {latestFeedback && (
        <Alert type={approvalStatus === "Approved" ? "info" : "warning"} className={styles["feedback-alert"]}>
          <h4>This study has new feedback:</h4>
          <p>{latestFeedback}</p>

          {approvalStatus !== "Approved" && (
            <>
              <hr></hr>
              <small>
                <em>Please adjust as appropriate and request another review.</em>
              </small>
            </>
          )}

          <Button
            variant="tertiary"
            size="small"
            onClick={() => setHistoryOpen(true)}
            data-cy="view-feedback-history-button"
          >
            View feedback history
          </Button>
        </Alert>
      )}

      {historyOpen && (
        <Dialog setDialogOpen={setHistoryOpen} className={styles["history-dialog"]}>
          <h3>Feedback history</h3>
          <ul className={styles["history-list"]} data-cy="study-feedback-history">
            {newestFirst.map((entry) => (
              <li key={entry.id} className={styles["history-item"]}>
                <div className={styles["history-meta"]}>
                  <span>{formatDateTime(entry.created_at)}</span>
                  <span>{entry.reviewer_username}</span>
                  <span>{displayStatus(entry.status)}</span>
                </div>
                {entry.feedback && <p>{entry.feedback}</p>}
              </li>
            ))}
          </ul>
        </Dialog>
      )}
    </div>
  );
}
