import { useState } from "react";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { putUsersByUserIdAttributes } from "@/openapi";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";
import styles from "./ChosenNameForm.module.css";
import Error from "@/components/ui/Error";
import { HelperText } from "../shared/uikitExports";

type Props = {
  userId: string;
  currentChosenName?: string;
  setChosenNameDialogOpen: (open: boolean) => void;
  callback: () => void;
};

export default function ChosenNameForm(props: Props) {
  const { userId, currentChosenName, setChosenNameDialogOpen, callback } = props;
  const [chosenName, setChosenName] = useState(currentChosenName || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await putUsersByUserIdAttributes({
        path: {
          userId: userId,
        },
        body: {
          chosen_name: chosenName,
        },
      });

      if (responseIsError(response)) {
        const errorMsg = extractErrorMessage(response);
        setErrorMessage(errorMsg);
        return;
      }
      callback();
      setChosenNameDialogOpen(false);
    } catch (error) {
      console.error("Failed to update chosen name:", error);
      setErrorMessage("Failed to update chosen name. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog setDialogOpen={() => setChosenNameDialogOpen(false)} className={styles["chosen-name-dialog"]}>
      <form onSubmit={handleSubmit} className="form">
        <div className="field">
          <label htmlFor="chosenName" className={styles.label}>
            Chosen Name
          </label>
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
          <HelperText>
            Please only update a user&apos;s chosen name if they have submitted a request through My Services.
          </HelperText>
        </div>

        {errorMessage && <Error message={errorMessage} />}

        <div className={styles["button-group"]}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setChosenNameDialogOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button type="submit" variant="primary" disabled={isSubmitting} data-cy="save-name">
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
