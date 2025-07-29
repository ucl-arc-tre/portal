import Button from "@/components/ui/Button";
import { useState } from "react";
import { Input } from "../shared/exports";
import styles from "./ExternalInvite.module.css";
import { postUsersInvite } from "@/openapi";

export default function ExternalInvite() {
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [isInputVisible, setInputVisible] = useState(false);

  function handleShowInput() {
    setInputVisible(true);
  }

  async function handleSumbit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    try {
      setButtonDisabled(true);
      if (typeof email === "string") {
        const response = await postUsersInvite({ body: { email } });
        console.log("response", response);
      } else {
        // redundant maybe?
        console.error("Email not in correct format.");
      }
    } catch (err) {
      console.error("Invite post error:", err);
    } finally {
      setButtonDisabled(false);
    }

    console.log("sending...", email);
  }

  return (
    <div className={styles.container}>
      {isInputVisible ? (
        <form onSubmit={handleSumbit}>
          <Input type="email" placeholder="Email address" name="email" />
          <Button
            disabled={buttonDisabled}
            type="submit"
            cy="send-invite"
            size="small"
            className={styles["send-button"]}
          >
            Send Invitation
          </Button>{" "}
        </form>
      ) : (
        <Button
          onClick={handleShowInput}
          disabled={buttonDisabled}
          variant="secondary"
          cy="show-invite-input"
          type="button"
          size="small"
        >
          Invite external researcher
        </Button>
      )}
    </div>
  );
}
