import { FormEvent, useRef, useState } from "react";
import styles from "./UsernameForm.module.css";
import Button from "../ui/Button";
import { postPeopleUpdate } from "@/openapi";
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
const Input = dynamic(() => import("uikit-react-public").then((mod) => mod.Input), {
  ssr: false,
});

type UserameFormProps = {
  id: string;
  setUsernameDialogOpen: (name: boolean) => void;
};

export default function UsernameForm(UserameFormProps: UserameFormProps) {
  const { id, setUsernameDialogOpen } = UserameFormProps;
  const [inputNameValue, setInputNameValue] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<AlertType>("warning");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const regex = /^[A-Za-z0-9@\-.]*$/u;

  const closeDialog = () => {
    dialogRef.current?.close();
    setUsernameDialogOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const username = inputNameValue.trim();

    if (!username) return setErrorMessage("Please enter a name.");
    if (!regex.test(username)) return setErrorMessage("Please enter a valid username");

    try {
      const response = await postPeopleUpdate({ query: { id: id }, body: { username: username } });
      if (!response.response.ok) throw new Error(`HTTP error! status: ${response.response.status}`);

      closeDialog();
    } catch (error) {
      console.error("There was a problem submitting your request:", error);
      setErrorMessage("Failed to submit username. Please try again.");
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
          <p>Please enter an email address. This will be your username</p>

          <Input
            type="email"
            name="username"
            value={inputNameValue}
            placeholder="e.g. t.jones@ucl.ac.uk"
            onChange={(e) => {
              setInputNameValue(e.target.value);
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
