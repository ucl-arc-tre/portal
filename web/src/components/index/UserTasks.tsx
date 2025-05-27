import { useAuth } from "@/hooks/useAuth";
import LoginFallback from "@/components/ui/LoginFallback";
import Button from "../ui/Button";
import { FormEvent, useRef, useState } from "react";
import styles from "./UserTasks.module.css";
import { postProfile } from "@/openapi";

export default function UserTasks() {
  const { loading, isAuthed, userData } = useAuth();
  const [chosenName, setChosenName] = useState<string>("");
  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const inputElement = event.currentTarget.elements.namedItem("chosenName") as HTMLInputElement;
    const chosenName = inputElement.value;
    const dialogElement = dialogRef.current;
    const regex = /^[A-Za-z-]*$/; // allow letters and hyphens

    if (!chosenName || chosenName.trim() === "") {
      alert("Please enter a name");
    } else if (!regex.test(chosenName)) {
      alert("Please enter a valid name; only letters and hyphens are allowed");
    } else {
      try {
        const response = await postProfile({
          body: { chosen_name: chosenName },
        });
        if (!response.response.ok) {
          throw new Error(`HTTP error! status: ${response.response.status}`);
        } else {
          console.log(response.response);
          setChosenName(chosenName);
          dialogElement!.close();
        }
      } catch (error) {
        console.error("There was a problem submitting your request:", error);
      }
    }
  };
  if (loading) return null;

  if (!isAuthed) return <LoginFallback />;

  return (
    <div>
      {!userData!.chosen_name && (
        <dialog open ref={dialogRef} className={styles.dialog} data-cy="chosenName">
          <form onSubmit={handleSubmit}>
            Please enter your name as you would choose to have it appear on forms related to our services.
            <input type="text" name="chosenName"></input>
            <Button type="submit">Submit</Button>
          </form>
        </dialog>
      )}
      <p>
        Name: {userData!.chosen_name || chosenName}. Username&nbsp;{userData!.username}. Roles:&nbsp;
        {userData!.roles.join(", ")}
      </p>
      <div>
        <h3>Your tasks:</h3>
        <div>List of user tasks here (e.g. approved researcher process)</div>
      </div>
    </div>
  );
}
