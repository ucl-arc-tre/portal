import Link from "next/link";
import styles from "./Feedback.module.css";
import { useState } from "react";
import Dialog from "./Dialog";
import { Alert, AlertMessage, Textarea } from "../shared/uikitExports";
import Error from "./Error";
import Button from "./Button";
import { postFeedback } from "@/openapi";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";

const email = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "arc.tre@ucl.ac.uk";
const useMyservices = process.env.NEXT_PUBLIC_ENABLE_MYSERVICES === "true";

export default function Feedback() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFeedbackChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeedback(event.target.value);
    if (event.target.value.length > 0 && error) setError(null);
  };

  async function onSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!feedback) {
      setError("No feedback set");
      return;
    }

    try {
      setError("");
      setSubmitting(true);

      const response = await postFeedback({
        body: { message: feedback },
      });

      if (responseIsError(response)) {
        setError(`Failed to submit feedback: ${extractErrorMessage(response)}`);
        return;
      }
      setFeedback("");
      setSuccessMessage("Thank you for submitting feedback");
    } catch {
      setError("Failed to update study owner. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!useMyservices) {
    const encodedEmailBody = encodeURI("Dear Portal Team,\n\n ...");
    const emailSubject = "ARC Services Portal feedback";
    return (
      <Link className={styles.button} href={`mailto:${email}?subject=${emailSubject}&body=${encodedEmailBody}`}>
        {"Feedback"}
      </Link>
    );
  }

  return (
    <>
      <button className={styles.button} onClick={() => setDialogOpen(true)}>
        {"Feedback"}
      </button>

      {dialogOpen && (
        <Dialog
          setDialogOpen={(show) => {
            setDialogOpen(show);
            setError(null);
            setSuccessMessage(null);
          }}
        >
          <h2>Feedback</h2>

          <form className="form" onSubmit={onSubmit}>
            <p>
              We are very keen to hear your feedback. Please let us know how we can improve the portal or any bugs you
              have found.
            </p>

            {!successMessage && (
              <>
                <label htmlFor="feedback">
                  <Textarea
                    name="feedback"
                    id="feedback"
                    cols={30}
                    rows={10}
                    value={feedback}
                    onChange={handleFeedbackChange}
                  />
                </label>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit"}
                </Button>
              </>
            )}
            {error && <Error message={error} />}
            {successMessage && (
              <Alert type="info">
                <AlertMessage>{successMessage}</AlertMessage>
              </Alert>
            )}
          </form>
        </Dialog>
      )}
    </>
  );
}
