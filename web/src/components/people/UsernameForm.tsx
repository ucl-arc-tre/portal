import { FormEvent, useState } from "react";
import styles from "./Form.module.css";
import Button from "../ui/Button";
import { postPeopleUpdate, TrainingRecord } from "@/openapi";
import dynamic from "next/dynamic";
import { AlertType } from "uikit-react-public/dist/components/Alert/Alert";
import AdminDialog from "./AdminDialog";
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
  updatePersonUI: (id: string, training?: TrainingRecord, username?: string) => void;
};

export default function UsernameForm(UserameFormProps: UserameFormProps) {
  const { id, setUsernameDialogOpen, updatePersonUI } = UserameFormProps;
  const [inputNameValue, setInputNameValue] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<AlertType>("warning");
  const regex = /^[A-Za-z0-9@\-.]*$/u;

  const closeDialog = () => {
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

      updatePersonUI(id, undefined, username);
    } catch (error) {
      console.error("There was a problem submitting your request:", error);
      setErrorMessage("Failed to submit username. Please try again.");
      setErrorType("error");
    }
  };

  return (
    <>
      <AdminDialog setDialogOpen={setUsernameDialogOpen} data-cy="username">
        <form onSubmit={handleSubmit} noValidate className={styles.form}>
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
      </AdminDialog>
    </>
  );
}
