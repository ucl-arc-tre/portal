import { FormEvent, useState } from "react";
import { postProfile } from "@/openapi";
import dynamic from "next/dynamic";
import { AlertType } from "uikit-react-public/dist/components/Alert/Alert";
import Button from "../../ui/Button";

import styles from "./ChosenName.module.css";

const Alert = dynamic(() => import("uikit-react-public").then((mod) => mod.Alert), {
  ssr: false,
});
const AlertMessage = dynamic(() => import("uikit-react-public").then((mod) => mod.Alert.Message), {
  ssr: false,
});
const Input = dynamic(() => import("uikit-react-public").then((mod) => mod.Input), {
  ssr: false,
});

type ProfileChosenNameProps = {
  currentName?: string;
  setChosenName: (name: string) => void;
};

export default function ProfileChosenName(props: ProfileChosenNameProps) {
  const { currentName, setChosenName } = props;

  const [inputNameValue, setInputNameValue] = useState(currentName || "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<AlertType>("warning");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const regex = /^[A-Za-z\s-]+(\p{M}\p{L}*)*$/u;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = inputNameValue.trim();

    if (!name) return setErrorMessage("Please enter a name.");
    if (!regex.test(name)) return setErrorMessage("Please enter a valid name. Only letters and hyphens are allowed.");

    setIsSubmitting(true);
    try {
      const response = await postProfile({ body: { chosen_name: name } });
      if (!response.response.ok) throw new Error(`HTTP error! status: ${response.response.status}`);

      setChosenName(name);
      setErrorMessage(null);
    } catch (error) {
      console.error("There was a problem submitting your request:", error);
      setErrorMessage("Failed to submit name. Please try again.");
      setErrorType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles["chosen-name-container"]} data-cy="chosen-name-form">
      <h3 className={styles.title}>Set Your Chosen Name</h3>
      <div className={styles.description}>
        Please enter your name as you would choose to have it appear on forms related to our services.
        <div>
          <strong> This name must match the name on your training certificate</strong> that you will upload in the next
          step.
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        <div className={styles["input-group"]}>
          <label htmlFor="chosenNameInput" className={styles.label}>
            Chosen Name
          </label>
          <Input
            id="chosenNameInput"
            type="text"
            name="chosenName"
            value={inputNameValue}
            placeholder="e.g. Alice Smith"
            minLength={3}
            maxLength={100}
            onChange={(e) => {
              setInputNameValue(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            aria-invalid={!!errorMessage}
            aria-describedby="chosenNameError"
            className={styles.input}
          />
        </div>

        {errorMessage && (
          <Alert type={errorType} className={styles.alert}>
            <AlertMessage>{errorMessage}</AlertMessage>
          </Alert>
        )}

        <Button type="submit" size="large" disabled={isSubmitting} className={styles["submit-button"]}>
          {isSubmitting ? "Saving..." : "Save Name"}
        </Button>
      </form>
    </section>
  );
}
