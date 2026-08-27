import { useState } from "react";
import { StudyApprovalStatus, StudyFeedbackEntry } from "@/openapi";
import Button from "../../ui/Button";
import Dialog from "../../ui/Dialog";
import styles from "./StudyFeedbackHistory.module.css";

type StudyFeedbackHistoryProps = {
  feedbackHistory: StudyFeedbackEntry[];
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

// The "Rejected" approval status is displayed as "Updates Requested" to match the StatusBadge
function displayStatus(status: StudyApprovalStatus) {
  return status === "Rejected" ? "Updates Requested" : status;
}

export default function StudyFeedbackHistory({ feedbackHistory }: StudyFeedbackHistoryProps) {
  const [historyOpen, setHistoryOpen] = useState(false);

  if (feedbackHistory.length === 0) return null;

  const newestFirst = [...feedbackHistory].reverse();

  return (
    <>
      <Button
        variant="secondary"
        size="small"
        onClick={() => setHistoryOpen(true)}
        data-cy="view-feedback-history-button"
      >
        View feedback history
      </Button>

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
    </>
  );
}
