import { useState } from "react";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { putProfile } from "@/openapi";
import styles from "./ChosenNameForm.module.css";

type Props = {
  userId: string;
  currentChosenName: string;
  setChosenNameDialogOpen: (open: boolean) => void;
  updateChosenNameCell: (userId: string, chosenName: string) => void;
};

export default function ChosenNameForm(props: Props) {
  const { userId, currentChosenName, setChosenNameDialogOpen, updateChosenNameCell } = props;
  const [chosenName, setChosenName] = useState(currentChosenName || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await putProfile({
        body: {
          user_id: userId,
          chosen_name: chosenName,
        },
      });

      if (response.response.ok) {
        updateChosenNameCell(userId, chosenName);
        setChosenNameDialogOpen(false);
      } else {
        setErrorMessage("Failed to update chosen name");
      }
    } catch (error) {
      console.error("Failed to update chosen name:", error);
      setErrorMessage("Failed to update chosen name. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog setDialogOpen={() => setChosenNameDialogOpen(false)} className={styles["chosen-name-dialog"]}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <p className={styles["help-text"]}>
          Please only update a user&apos;s chosen name if they have submitted a request through My Services.
        </p>
        <div className={styles["form-group"]}>
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
        </div>

        {errorMessage && <div className={styles.error}>{errorMessage}</div>}

        <div className={styles["button-group"]}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setChosenNameDialogOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
