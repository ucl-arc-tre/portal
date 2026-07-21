import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import styles from "./ChosenNameChangeModal.module.css";
import { useState } from "react";
import { postProfile } from "@/openapi";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";
import { Alert, AlertMessage } from "../shared/uikitExports";
import Error from "../ui/Error";

type ChosenNameChangeModalProps = {
  isOpen: boolean;
  onSuccses: () => void;
  currentChosenName?: string;
  username?: string;
};

export default function ChosenNameChangeModal({ isOpen, onSuccses, currentChosenName }: ChosenNameChangeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [chosenName, setChosenName] = useState(currentChosenName ?? "");

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await postProfile({
        body: {
          chosen_name: chosenName,
        },
      });

      if (responseIsError(response)) {
        setErrorMessage(`Failed to update chosen name: ${extractErrorMessage(response)}`);
        return;
      }
      onSuccses();
    } catch (error) {
      console.error("Failed to update chosen name:", error);
      setErrorMessage("Failed to update chosen name. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog setDialogOpen={onSuccses}>
      <div>
        <form onSubmit={handleSubmit} className="form">
          <div className="field">
            <label htmlFor="chosenName">Chosen Name</label>
            <input
              id="chosenName"
              type="text"
              value={chosenName}
              onChange={(e) => setChosenName(e.target.value)}
              required
              minLength={3}
              maxLength={100}
              className={styles.input}
            />
          </div>
          <Alert type="info">
            <AlertMessage>
              Please note that a name change may be subject to approval. If an approval is required the request will
              remain in a pending state until approved.
            </AlertMessage>
          </Alert>

          <Button variant="primary" disabled={isSubmitting} type="submit" cy="request-name-change">
            Request
          </Button>
        </form>

        {errorMessage && <Error message={errorMessage} />}
      </div>
    </Dialog>
  );
}
