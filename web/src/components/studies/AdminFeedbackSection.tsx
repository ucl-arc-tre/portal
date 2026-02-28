import Box from "../ui/Box";
import { Alert, AlertMessage, Textarea } from "../shared/exports";
import styles from "./AdminFeedbackSection.module.css";
import Button from "../ui/Button";
import { useState } from "react";
import { ApprovalStatus } from "@/openapi";
type FeedbackProps = {
  status: ApprovalStatus;
  feedbackFromStudy: string;
  handleUpdateStudyStatus: (
    status: ApprovalStatus,
    feedbackContent?: string
  ) => Promise<
    | ({ data: unknown; error: undefined } & { request: Request; response: Response })
    | ({ data: undefined; error: unknown } & { request: Request; response: Response })
    | undefined
  >;
};
export default function AdminFeedbackSection(props: FeedbackProps) {
  const { status, feedbackFromStudy, handleUpdateStudyStatus } = props;
  const [feedback, setFeedback] = useState(feedbackFromStudy);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleFeedbackChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeedback(event.target.value);
  };

  const handleStudyStatusUpdate = async (status: ApprovalStatus, feedbackContent?: string) => {
    setSuccessMessage("");
    setErrorMessage("");
    setFeedback("");
    setSubmitted(true);
    const err = await handleUpdateStudyStatus(status, feedbackContent);
    if (!err) {
      setSuccessMessage("Updated successfully");
    } else {
      setErrorMessage("Something went wrong please try again");
    }
  };

  return (
    <>
      {(status === "Pending" || status === "Rejected") && (
        <div className={styles["buttons-container"]}>
          <Button
            className={styles["approve-button"]}
            onClick={() => handleStudyStatusUpdate("Approved", feedback)}
            data-cy="study-approve-button"
            disabled={submitted}
          >
            Approve Study
          </Button>
          <Button
            variant="secondary"
            className={styles["reject-button"]}
            onClick={() => handleStudyStatusUpdate("Rejected", feedback)}
            disabled={feedback.length === 0 || submitted}
          >
            Request Changes
          </Button>
        </div>
      )}

      {status === "Approved" && (
        <div className={styles["buttons-container"]}>
          <Button onClick={() => handleStudyStatusUpdate("Approved", feedback)} disabled={feedback.length === 0}>
            {feedback.length > 0 ? "Update Feedback" : "Add Feedback"}
          </Button>
        </div>
      )}

      {(errorMessage || successMessage) && (
        <Alert type={errorMessage ? "error" : "success"}>
          <AlertMessage>{errorMessage || successMessage}</AlertMessage>
        </Alert>
      )}

      {status !== "Incomplete" && (
        <Box>
          <div className={styles["feedback-container"]}>
            <form className={styles["feedback-form"]}>
              <label htmlFor="feedback">
                Optionally provide feedback for the study owner. This can be advice for future management or things
                required for approval. <br></br>To reject the study you must provide feedback.
              </label>
              <Textarea
                name="feedback"
                id="feedback"
                cols={30}
                rows={10}
                onChange={handleFeedbackChange}
                value={feedback}
              />
            </form>
          </div>
        </Box>
      )}
    </>
  );
}
