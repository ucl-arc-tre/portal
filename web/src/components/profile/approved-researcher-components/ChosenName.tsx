import { SubmitEvent, useState } from "react";
import { postProfile } from "@/openapi";
import { AlertType } from "uikit-react-public/dist/components/Alert/Alert";
import Button from "../../ui/Button";

import styles from "./ChosenName.module.css";
import { Alert, AlertMessage, Input } from "@/components/shared/exports";

type ProfileChosenNameProps = {
  currentName?: string;
  setName: (name: string) => void;
};

export default function ProfileChosenName(props: ProfileChosenNameProps) {
  const { currentName, setName: setName } = props;

  const [inputNameValue, setInputNameValue] = useState(currentName || "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<AlertType>("warning");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const regex = /^[\p{L}\p{M}}\s\-'’]+[\s][\p{L}\p{M}}\s\-\.'’]+$/u;

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = inputNameValue.trim();

    if (!name) return setErrorMessage("Please enter a name.");
    if (!regex.test(name)) return setErrorMessage("Please enter a valid full name.");

    setIsSubmitting(true);
    try {
      const response = await postProfile({ body: { chosen_name: name } });
      if (!response.response.ok) throw new Error(`HTTP error! status: ${response.response.status}`);

      setName(name);
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
      <h3 className={styles.title}>Set Your Name</h3>
      <div className={styles.description}>
        Please enter your name as you would choose to have it appear on forms related to our services.
        <div>
          <strong> This name must match the name on your training certificate</strong> that you will verify in the next
          step.
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles["input-group"]}>
          <label htmlFor="nameInput" className={styles.label}>
            Full Name
          </label>
          <Input
            id="nameInput"
            type="text"
            name="name"
            value={inputNameValue}
            placeholder="e.g. Alice Smith"
            minLength={3}
            maxLength={100}
            onChange={(e) => {
              setInputNameValue(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            aria-invalid={!!errorMessage}
            aria-describedby="nameError"
            className={styles.input}
            required
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
