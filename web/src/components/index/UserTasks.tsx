import { useAuth } from "@/hooks/useAuth";
import LoginFallback from "@/components/ui/LoginFallback";
import Button from "@/components/ui/Button";
import { FormEvent, useEffect, useRef, useState } from "react";
import styles from "./UserTasks.module.css";
import { postProfile, getProfile } from "@/openapi";

export default function UserTasks() {
  const { loading, isAuthed, userData } = useAuth();
  const [chosenName, setChosenName] = useState<string | undefined>(undefined);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    try {
      getProfile().then((response) => {
        if (response.response.ok && response.data?.chosen_name) {
          setChosenName(response.data?.chosen_name);
        } else {
          setChosenName("");
        }
      });
    } catch (error) {
      console.error("Failed to get profile:", error);
    }
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const inputElement = event.currentTarget.elements.namedItem("chosenName") as HTMLInputElement;
    const chosenName = inputElement.value;
    const dialogElement = dialogRef.current;
    const regex = /^[A-Za-z\s-]+(\p{M}\p{L}*)*$/u; // allow letters including diacritics and hyphens

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
          setChosenName(chosenName);
          dialogElement!.close();
        }
      } catch (error) {
        console.error("There was a problem submitting your request:", error);
      }
    }
  };

  if (loading || chosenName === undefined) return null;

  if (!isAuthed) return <LoginFallback />;

  return (
    <div>
      {!chosenName && (
        <dialog open ref={dialogRef} className={styles.dialog} data-cy="chosenName">
          <form onSubmit={handleSubmit}>
            Please enter your name as you would choose to have it appear on forms related to our services.
            <input type="text" name="chosenName"></input>
            <Button type="submit">Submit</Button>
          </form>
        </dialog>
      )}
      <p>
        Name: {chosenName}. Username&nbsp;{userData!.username}. Roles:&nbsp;
        {userData!.roles.join(", ")}
      </p>
      <div>
        <h3>Your tasks:</h3>
        <div>List of user tasks here (e.g. approved researcher process)</div>
      </div>
    </div>
  );
}
