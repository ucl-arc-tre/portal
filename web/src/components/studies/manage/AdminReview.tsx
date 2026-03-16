import Box from "../../ui/Box";
import { Alert, AlertMessage, Textarea } from "../../shared/uikitExports";
import Button from "../../ui/Button";
import { useState } from "react";
import { ApprovalStatus, postStudiesAdminByStudyIdReview, Study } from "@/openapi";
import { extractErrorMessage } from "@/lib/errorHandler";

import styles from "./AdminReview.module.css";

type AdminReviewProps = {
  study: Study;
  unagreedAdminUsernames: string[];
  onReviewComplete: () => Promise<void>;
};

export default function AdminReview({ study, unagreedAdminUsernames, onReviewComplete }: AdminReviewProps) {
  const [loadingAction, setLoadingAction] = useState<ApprovalStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState(study.feedback ?? "");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [feedbackRequired, setFeedbackRequired] = useState(false);

  const status = study.approval_status;
  const hasUnagreedAdmins = unagreedAdminUsernames.length > 0;

  const handleFeedbackChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeedback(event.target.value);
    if (event.target.value.length > 0) setFeedbackRequired(false);
  };

  const handleStudyStatusUpdate = async (newStatus: ApprovalStatus, feedbackContent?: string) => {
    if ((newStatus === "Rejected" || (newStatus === "Approved" && status === "Approved")) && !feedbackContent) {
      setFeedbackRequired(true);
      return;
    }

    setSuccessMessage(null);
    setError(null);
    setLoadingAction(newStatus);

    try {
      const response = await postStudiesAdminByStudyIdReview({
        path: { studyId: study.id },
        body: { status: newStatus, feedback: feedbackContent },
      });

      if (!response.response.ok) {
        setError(`Failed to update study status: ${extractErrorMessage(response)}`);
        return;
      }

      setFeedback("");
      setSuccessMessage("Updated successfully");
      await onReviewComplete();
    } catch {
      setError("Failed to update study status. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <>
      {(status === "Pending" || status === "Rejected") && (
        <Box>
          <h3 className={styles["heading"]}>Review Study</h3>

          <p>
            Review all aspects of the study, including its details, information assets, and contracts, before making a
            decision. You may optionally provide feedback to the study owner, or include a reason if requesting changes.
          </p>

          <div className={styles["feedback-container"]}>
            <form className={styles["feedback-form"]}>
              <label htmlFor="feedback">Feedback</label>
              <Textarea
                name="feedback"
                id="feedback"
                cols={30}
                rows={10}
                placeholder="Optionally provide feedback for the study owner..."
                onChange={handleFeedbackChange}
                value={feedback}
              />
            </form>

            {hasUnagreedAdmins && (
              <Alert type="warning">
                <AlertMessage>
                  The following administrators have not yet agreed to the study agreement:{" "}
                  {unagreedAdminUsernames.map((username, index) => (
                    <span key={username}>
                      <strong>{username}</strong>
                      {index < unagreedAdminUsernames.length - 1 ? ", " : ""}
                    </span>
                  ))}
                  . The study cannot be approved until all administrators have agreed. Please inform all admins to log
                  into the portal to sign the agreement.
                </AlertMessage>
              </Alert>
            )}

            <div className={styles["buttons-container"]}>
              <Button
                className={styles["approve-button"]}
                onClick={() => handleStudyStatusUpdate("Approved", feedback)}
                data-cy="study-approve-button"
                disabled={!!loadingAction || hasUnagreedAdmins}
              >
                {loadingAction === "Approved" ? "Approving..." : "Approve Study"}
              </Button>

              <Button
                variant="secondary"
                className={styles["reject-button"]}
                onClick={() => handleStudyStatusUpdate("Rejected", feedback)}
                disabled={!!loadingAction}
              >
                {loadingAction === "Rejected" ? "Requesting Changes..." : "Request Changes"}
              </Button>
            </div>

            {feedbackRequired && (
              <small className={styles["feedback-required"]}>Please provide feedback before requesting changes.</small>
            )}
          </div>
        </Box>
      )}

      {status === "Approved" && (
        <Box>
          <h3 className={styles["heading"]}>Feedback</h3>
          <p>This study has been approved, but you can still provide feedback at any time.</p>

          <div className={styles["feedback-container"]}>
            <form className={styles["feedback-form"]}>
              <label htmlFor="feedback">Feedback</label>
              <Textarea
                name="feedback"
                id="feedback"
                cols={30}
                rows={10}
                placeholder="Optionally provide feedback for the study owner..."
                onChange={handleFeedbackChange}
                value={feedback}
              />
            </form>

            <div className={styles["buttons-container"]}>
              <Button onClick={() => handleStudyStatusUpdate("Approved", feedback)} disabled={!!loadingAction}>
                {loadingAction === "Approved" ? "Saving..." : feedback.length > 0 ? "Update Feedback" : "Add Feedback"}
              </Button>
            </div>

            {feedbackRequired && (
              <small className={styles["feedback-required"]}>Please provide feedback before submitting.</small>
            )}
          </div>
        </Box>
      )}

      {(error || successMessage) && (
        <Alert type={error ? "error" : "success"}>
          <AlertMessage>{error || successMessage}</AlertMessage>
        </Alert>
      )}
    </>
  );
}
