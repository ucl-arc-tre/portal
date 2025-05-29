import { FormEvent, useRef, useState } from "react";
import styles from "./ChosenNameForm.module.css";
import Button from "../ui/Button";
import { postProfile } from "@/openapi";
import dynamic from "next/dynamic";
import { AlertType } from "uikit-react-public/dist/components/Alert/Alert";

const Blanket = dynamic(() => import("uikit-react-public").then((mod) => mod.Blanket), {
  ssr: false,
});
const Alert = dynamic(() => import("uikit-react-public").then((mod) => mod.Alert), {
  ssr: false,
});
const AlertMessage = dynamic(() => import("uikit-react-public").then((mod) => mod.Alert.Message), {
  ssr: false,
});
const Input = dynamic(() => import("uikit-react-public").then((mod) => mod.Input), {
  ssr: false,
});

type ChosenNameFormProps = {
  setChosenName: (name: string) => void;
};

export default function ChosenNameForm(props: ChosenNameFormProps) {
  const { setChosenName } = props;

  const [inputNameValue, setInputNameValue] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<AlertType>("warning");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const regex = /^[A-Za-z\s-]+(\p{M}\p{L}*)*$/u;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = inputNameValue.trim();

    if (!name) return setErrorMessage("Please enter a name.");
    if (!regex.test(name)) return setErrorMessage("Please enter a valid name. Only letters and hyphens are allowed.");

    try {
      const response = await postProfile({ body: { chosen_name: name } });
      if (!response.response.ok) throw new Error(`HTTP error! status: ${response.response.status}`);

      setChosenName(name);
      dialogRef.current?.close();
    } catch (error) {
      console.error("There was a problem submitting your request:", error);
      setErrorMessage("Failed to submit name. Please try again.");
      setErrorType("error");
    }
  };

  return (
    <>
      <dialog open ref={dialogRef} className={styles.dialog} data-cy="chosenName">
        <form onSubmit={handleSubmit} noValidate>
          <p>Please enter your name as you would choose to have it appear on forms related to our services.</p>

          <Input
            type="text"
            name="chosenName"
            value={inputNameValue}
            onChange={(e) => {
              setInputNameValue(e.target.value);
              if (errorMessage) setErrorMessage(null); // Clear error as user types
            }}
            aria-invalid={!!errorMessage}
            aria-describedby="chosenNameError"
          />

          {errorMessage && (
            <Alert type={errorType}>
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
