import Box from "../ui/Box";
import { Textarea } from "../shared/exports";
import styles from "./AdminFeedbackSection.module.css";
import Button from "../ui/Button";
import { useState } from "react";

type FeedbackProps = {
  status: string;
  feedbackFromStudy: string;
  handleUpdateStudyStatus: (status: string, feedbackContent?: string) => void;
};
export default function AdminFeedbackSection(props: FeedbackProps) {
  const { status, feedbackFromStudy, handleUpdateStudyStatus } = props;
  const [feedback, setFeedback] = useState(feedbackFromStudy);

  const handleFeedbackChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeedback(event.target.value);
  };

  return (
    <>
      {(status === "Pending" || status === "Rejected") && (
        <div>
          <Button className={styles["approve-button"]} onClick={() => handleUpdateStudyStatus("Approved", feedback)}>
            Approve Study
          </Button>
          <Button
            variant="secondary"
            className={styles["reject-button"]}
            onClick={() => handleUpdateStudyStatus("Rejected", feedback)}
            disabled={feedback.length === 0}
          >
            Request Changes
          </Button>
        </div>
      )}

      {status === "Approved" && (
        <div>
          <Button onClick={() => handleUpdateStudyStatus("Approved", feedback)}>
            {feedback.length > 0 ? "Update Feedback" : "Add Feedback"}
          </Button>
        </div>
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
