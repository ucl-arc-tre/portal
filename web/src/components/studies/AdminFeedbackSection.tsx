import Box from "../ui/Box";
import { Textarea } from "../shared/exports";
import styles from "./AdminFeedbackSection.module.css";
import Button from "../ui/Button";
import { useState } from "react";

type FeedbackProps = {
  status: string;
  feedback: string;
  setFeedback: (feedback: string) => void;
  handleUpdateStudyStatus: (status: string) => void;
};
export default function AdminFeedbackSection(props: FeedbackProps) {
  const { status, feedback, setFeedback, handleUpdateStudyStatus } = props;
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [isCollapsing, setIsCollapsing] = useState(false);

  const toggleShowFeedbackForm = () => {
    // for smooth collapse
    if (showFeedbackForm) {
      setIsCollapsing(true);
      setTimeout(() => {
        setShowFeedbackForm(false);
        setIsCollapsing(false);
      }, 1400);
    } else {
      setShowFeedbackForm(true);
    }
  };

  const handleFeedbackSubmit = () => {
    handleUpdateStudyStatus("Rejected");
    toggleShowFeedbackForm();
  };

  const handleFeedbackChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeedback(event.target.value);
  };
  return (
    <>
      {(status === "Pending" || status === "Rejected") && (
        //TODO: check why feedback not showing up after edit since abstraction
        <div>
          <Button className={styles["approve-button"]} onClick={() => handleUpdateStudyStatus("Approved")}>
            Approve Study
          </Button>
          <Button variant="secondary" className={styles["reject-button"]} onClick={toggleShowFeedbackForm}>
            {showFeedbackForm ? "Cancel" : "Request Changes"}
          </Button>
        </div>
      )}

      {showFeedbackForm && (
        <Box>
          <div className={styles["feedback-container"]}>
            <form
              className={`${styles["feedback-form"]} ${
                isCollapsing
                  ? styles["form-collapsing"]
                  : showFeedbackForm
                    ? styles["form-visible"]
                    : styles["form-hidden"]
              }`}
            >
              <label htmlFor="feedback">Outline what the changes are required to attain approval</label>
              <Textarea
                name="feedback"
                id="feedback"
                cols={30}
                rows={10}
                onChange={handleFeedbackChange}
                value={feedback}
              />
              <Button onClick={handleFeedbackSubmit} type="button">
                Submit
              </Button>
            </form>
          </div>
        </Box>
      )}
    </>
  );
}
