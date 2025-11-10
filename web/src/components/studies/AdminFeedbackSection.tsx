import Box from "../ui/Box";
import { Textarea } from "../shared/exports";
import styles from "./AdminFeedbackSection.module.css";
import Button from "../ui/Button";

type FeedbackProps = {
  status: string;
  feedback: string;
  setFeedback: (feedback: string) => void;
  handleUpdateStudyStatus: (status: string) => void;
};
export default function AdminFeedbackSection(props: FeedbackProps) {
  const { status, feedback, setFeedback, handleUpdateStudyStatus } = props;

  const handleFeedbackChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeedback(event.target.value);
  };

  return (
    <>
      {(status === "Pending" || status === "Rejected") && (
        <div>
          <Button className={styles["approve-button"]} onClick={() => handleUpdateStudyStatus("Approved")}>
            Approve Study
          </Button>
          <Button
            variant="secondary"
            className={styles["reject-button"]}
            onClick={() => handleUpdateStudyStatus("Rejected")}
            disabled={feedback.length === 0}
          >
            Request Changes
          </Button>
        </div>
      )}

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
    </>
  );
}
