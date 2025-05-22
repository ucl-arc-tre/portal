import { useAuth } from "@/hooks/useAuth";
import LoginFallback from "@/components/ui/LoginFallback";
import Button from "../ui/Button";
import { FormEvent, useRef } from "react";
import styles from "./UserTasks.module.css";

export default function UserTasks() {
  const { loading, isAuthed, userData } = useAuth();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const inputElement = event.currentTarget.elements.namedItem("chosenName") as HTMLInputElement;
    const chosenName = inputElement.value;
    const dialogElement = dialogRef.current;

    try {
      const response = await fetch("/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chosen_name: chosenName }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      } else {
        dialogElement!.close();
      }
    } catch (error) {
      console.error("There was a problem submitting your request:", error);
    }
  };
  if (loading) return null;

  if (!isAuthed) return <LoginFallback />;

  return (
    <div>
      {!userData!.chosen_name && (
        <dialog open ref={dialogRef} id={styles.chosenName}>
          <form onSubmit={handleSubmit}>
            Please enter your name as you would choose to have it appear on forms related to our services.
            <input type="text" name="chosenName"></input>
            <Button type="submit">Submit</Button>
          </form>
        </dialog>
      )}
      <p>
        Name: {userData!.chosen_name}. Username&nbsp;{userData!.username}. Roles:&nbsp;
        {userData!.roles.join(", ")}
      </p>
      <div>
        <h3>Your tasks:</h3>
        <div>List of user tasks here (e.g. approved researcher process)</div>
      </div>
    </div>
  );
}
