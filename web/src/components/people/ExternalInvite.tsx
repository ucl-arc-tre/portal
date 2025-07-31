import Button from "@/components/ui/Button";
import { useState } from "react";
import { Input } from "../shared/exports";
import styles from "./ExternalInvite.module.css";
import { postUsersInvite } from "@/openapi";
import Loading from "@/components/ui/Loading";

export default function ExternalInvite() {
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [isInputVisible, setInputVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  function handleShowInput() {
    setInputVisible(true);
  }

  async function handleSumbit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setButtonDisabled(true);
      setIsLoading(true);
      if (typeof email === "string") {
        await postUsersInvite({ body: { email } });
      }
    } catch (err) {
      console.error("Invite post error:", err);
    } finally {
      setButtonDisabled(false);
      setIsLoading(false);
      setEmail("");
      setShowSuccessMessage(true);
    }
  }

  return (
    <div className={styles.container}>
      {showSuccessMessage && (
        <small onClick={() => setShowSuccessMessage(false)} className={styles["success-message"]}>
          Invitation sent!
        </small>
      )}
      <form onSubmit={handleSumbit} className={`${styles["slide-fade-down"]} ${isInputVisible ? "" : styles.hidden}`}>
        <Input
          type="email"
          placeholder="Email address"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button disabled={buttonDisabled} type="submit" cy="send-invite" size="small" className={styles["send-button"]}>
          {isLoading && (
            <span className={styles.loader}>
              <Loading message="" size="small" />
            </span>
          )}
          Send Invitation
        </Button>{" "}
      </form>
      <Button
        className={`${styles["slide-right-fade"]} ${isInputVisible ? styles.hidden : ""}`}
        onClick={handleShowInput}
        disabled={buttonDisabled}
        variant="secondary"
        cy="show-invite-input"
        type="button"
        size="small"
      >
        Invite external researcher
      </Button>
    </div>
  );
}
