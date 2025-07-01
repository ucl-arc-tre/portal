import { FormEvent, useState } from "react";
import styles from "./TrainingForm.module.css";
import Button from "../ui/Button";
import { postPeopleUpdate, TrainingKind, TrainingRecord } from "@/openapi";
import dynamic from "next/dynamic";
import { AlertType } from "uikit-react-public/dist/components/Alert/Alert";
import AdminDialog from "./AdminDialog";

const Alert = dynamic(() => import("uikit-react-public").then((mod) => mod.Alert), {
  ssr: false,
});
const AlertMessage = dynamic(() => import("uikit-react-public").then((mod) => mod.Alert.Message), {
  ssr: false,
});

const TrainingKindOptions = {
  //  is there a better way of doing this? Won't let me use type as a value
  nhsd: "training_kind_nhsd",
};

type TrainingFormProps = {
  id: string;
  setTrainingDialogOpen: (name: boolean) => void;
  updatePersonUI: (id: string, training?: TrainingRecord) => void;
};

export default function TrainingForm(TrainingFormProps: TrainingFormProps) {
  const { id, setTrainingDialogOpen, updatePersonUI } = TrainingFormProps;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<AlertType>("warning");

  const [trainingKind, setTrainingKind] = useState<TrainingKind | null>(null);
  const [trainingDisplayDate, setTrainingDisplayDate] = useState<string | undefined>(undefined);
  const [trainingDate, setTrainingDate] = useState<string | undefined>(undefined);

  const closeDialog = () => {
    setTrainingDialogOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!trainingKind) return setErrorMessage("Please provide a training kind.");
    if (!trainingDisplayDate) return setErrorMessage("Please enter the date the training was completed.");

    try {
      const response = await postPeopleUpdate({
        query: { id: id },
        body: { training_kind: trainingKind, training_date: trainingDate },
      });
      if (!response.response.ok) throw new Error(`HTTP error! status: ${response.response.status}`);

      closeDialog();

      // matching with db value so training_kind_nhsd shows as nhsd
      const trainingKindKey = Object.entries(TrainingKindOptions).find(([, value]) => value === trainingKind)?.[0];

      updatePersonUI(id, {
        kind: trainingKindKey as TrainingKind,
        completed_at: trainingDisplayDate,
        is_valid: true,
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

  return (
    <AdminDialog setDialogOpen={setTrainingDialogOpen} data-cy="training">
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
          {Object.entries(TrainingKindOptions).map((tk) => (
            <option key={tk[1]} value={tk[1]}>
              {tk[0]}
            </option>
          ))}
        </select>
        <div className={styles.date}>
          <input
            type="date"
            name="display_date"
            value={trainingDisplayDate}
            onChange={(e) => {
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
              className={styles.todayButton}
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
    </AdminDialog>
  );
}
