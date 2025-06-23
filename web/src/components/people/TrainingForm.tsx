import { FormEvent, useRef, useState } from "react";
import styles from "./UsernameForm.module.css";
import Button from "../ui/Button";
import { postPeopleUpdate, TrainingKind } from "@/openapi";
import dynamic from "next/dynamic";
import { AlertType } from "uikit-react-public/dist/components/Alert/Alert";
import { XIcon } from "./AdminView";

const Blanket = dynamic(() => import("uikit-react-public").then((mod) => mod.Blanket), {
  ssr: false,
});
const Alert = dynamic(() => import("uikit-react-public").then((mod) => mod.Alert), {
  ssr: false,
});
const AlertMessage = dynamic(() => import("uikit-react-public").then((mod) => mod.Alert.Message), {
  ssr: false,
});

const Trainingkind = {
  // todo: is there a better way of doing this?
  NHSD: "training_kind_nhsd",
};

type TrainingFormProps = {
  id: string;
  setTrainingDialogOpen: (name: boolean) => void;
};

export default function TrainingForm(TrainingFormProps: TrainingFormProps) {
  const { id, setTrainingDialogOpen } = TrainingFormProps;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<AlertType>("warning");
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [trainingKind, setTrainingKind] = useState<TrainingKind | null>(null);
  const [trainingDate, setTrainingDate] = useState<string | undefined>(undefined);

  const closeDialog = () => {
    dialogRef.current?.close();
    setTrainingDialogOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!trainingKind) return setErrorMessage("Please enter a name.");

    try {
      const response = await postPeopleUpdate({
        query: { id: id },
        body: { training_kind: trainingKind, training_date: trainingDate },
      });
      if (!response.response.ok) throw new Error(`HTTP error! status: ${response.response.status}`);
      console.log(response);

      closeDialog();
    } catch (error) {
      console.error("There was a problem submitting your request:", error);
      setErrorMessage("Failed to submit agreement update. Please try again.");
      setErrorType("error");
    }
  };

  return (
    <>
      <dialog open ref={dialogRef} className={styles.dialog} data-cy="username">
        <Button
          type="button"
          variant="tertiary"
          size="small"
          icon={<XIcon />}
          onClick={closeDialog}
          className={styles.closeButton}
        ></Button>
        <form onSubmit={handleSubmit} noValidate>
          <p>Use this form to validate a training certificate. If the date is left empty it will be set to today</p>

          <select
            id="training_kind"
            name="training_kind"
            value={trainingKind || ""}
            onChange={(e) => {
              setTrainingKind(e.target.value as TrainingKind);
              if (errorMessage) setErrorMessage(null);
            }}
            aria-invalid={!!errorMessage}
            aria-describedby="usernameError"
          >
            <option value="">Select Training Kind</option>
            {Object.entries(Trainingkind).map((training) => (
              <option key={training[1]} value={training[1]}>
                {training[0]}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="training_date"
            value={trainingDate}
            onChange={(e) => {
              setTrainingDate(e.target.value);
              if (errorMessage) setErrorMessage(null); // Clear error as user types
            }}
            aria-invalid={!!errorMessage}
            aria-describedby="usernameError"
          />

          {errorMessage && (
            <Alert type={errorType} className={styles.alert}>
              <AlertMessage>{errorMessage}</AlertMessage>
            </Alert>
          )}

          <Button type="submit">Submit</Button>
        </form>
      </dialog>
      <Blanket className={styles.blanket} />
    </>
  );
}
