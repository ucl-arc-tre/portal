import { FormEvent, useState } from "react";
import styles from "./TrainingForm.module.css";
import Button from "../ui/Button";
import { postPeopleById, TrainingKind, TrainingRecord } from "@/openapi";
import dynamic from "next/dynamic";
import { AlertType } from "uikit-react-public/dist/components/Alert/Alert";
import Dialog from "../ui/Dialog";
import { TrainingKindOptions } from "../assets/exports";
import InfoTooltip from "../ui/InfoTooltip";

const Alert = dynamic(() => import("uikit-react-public").then((mod) => mod.Alert), {
  ssr: false,
});
const AlertMessage = dynamic(() => import("uikit-react-public").then((mod) => mod.Alert.Message), {
  ssr: false,
});

type TrainingFormProps = {
  id: string;
  setTrainingDialogOpen: (name: boolean) => void;
  updatePersonUI: (id: string, training: TrainingRecord) => void;
};

export default function TrainingForm(TrainingFormProps: TrainingFormProps) {
  const { id, setTrainingDialogOpen, updatePersonUI } = TrainingFormProps;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<AlertType>("warning");

  const [trainingKind, setTrainingKind] = useState<TrainingKind | null>(null);
  const [trainingDisplayDate, setTrainingDisplayDate] = useState<string>("");
  const [trainingDate, setTrainingDate] = useState<string>("");

  const closeDialog = () => {
    setTrainingDialogOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!trainingKind) return setErrorMessage("Please provide a training kind.");
    if (!trainingDate) return setErrorMessage("Please enter the date the training was completed.");
    try {
      const response = await postPeopleById({
        path: { id: id },
        body: { training_kind: trainingKind, training_date: trainingDate },
      });
      if (!response.response.ok) throw new Error(`HTTP error! status: ${response.response.status}`);

      closeDialog();

      updatePersonUI(id, {
        kind: trainingKind as TrainingKind,
        completed_at: trainingDisplayDate,
        is_valid: response.data?.is_valid || false,
      });
    } catch (error) {
      console.error("There was a problem submitting your request:", error);
      setErrorMessage("Failed to submit agreement update. Please try again.");
      setErrorType("error");
    }
  };

  const setDateToToday = () => {
    const today = new Date().toISOString();
    setTrainingDisplayDate(today.split("T")[0]);
    setTrainingDate(today);
  };

  const updateTrainingDate = (date: string) => {
    const rfc3339Date = date + "T00:00:00Z";
    setTrainingDate(rfc3339Date);
  };

  return (
    <Dialog setDialogOpen={setTrainingDialogOpen} cy="training" className={styles["training-dialog"]}>
      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        <p>Use this form to validate a training certificate. Make sure you check the date on the certificate.</p>

        <select
          id="training_kind"
          name="training_kind"
          value={trainingKind || ""}
          onChange={(e) => {
            setTrainingKind(e.target.value as TrainingKind);
            if (errorMessage) setErrorMessage(null);
          }}
          aria-invalid={!!errorMessage}
          aria-describedby="trainingError"
        >
          <option value="">Select Training Kind</option>
          {Object.entries(TrainingKindOptions).map((trainingkind) => (
            <option key={trainingkind[1]} value={trainingkind[1]}>
              {trainingkind[0]}
            </option>
          ))}
        </select>
        <div className={styles.date}>
          <label htmlFor="display_date">
            Date valid from{" "}
            <InfoTooltip text="The date the training was completed, this can be found on the certificate." />
          </label>
          <input
            type="date"
            name="display_date"
            value={trainingDisplayDate}
            onChange={(e) => {
              updateTrainingDate(e.target.value);
              setTrainingDisplayDate(e.target.value);
              if (errorMessage) setErrorMessage(null); // Clear error as user types
            }}
            aria-invalid={!!errorMessage}
            aria-describedby="trainingError"
          />
          <small>
            <Button
              type="button"
              onClick={setDateToToday}
              size="small"
              variant="tertiary"
              className={styles["today-button"]}
              data-cy="set-to-today"
            >
              Set to Today
            </Button>
          </small>
          <input type="hidden" name="training_date" value={trainingDate} />
        </div>

        {errorMessage && (
          <Alert type={errorType} className={styles.alert}>
            <AlertMessage>{errorMessage}</AlertMessage>
          </Alert>
        )}

        <Button type="submit">Submit</Button>
      </form>
    </Dialog>
  );
}
