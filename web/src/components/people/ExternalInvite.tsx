import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { Input, Alert, AlertMessage, Label } from "../shared/exports";
import styles from "./ExternalInvite.module.css";
import { postUsersInvite } from "@/openapi";
import Loading from "@/components/ui/Loading";
import Dialog from "../ui/Dialog";

export default function ExternalInvite() {
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [isDialogVisible, setDialogVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleShowDialog() {
    setDialogVisible(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setButtonDisabled(true);
      setIsLoading(true);
      if (typeof email === "string") {
        await postUsersInvite({ body: { email } });
      }
    } catch (err) {
      console.error("Invite post error:", err);
      let errMessage;
      if (err instanceof Error) {
        errMessage = err.message;
      } else {
        errMessage = "An unknown error occurred";
      }
      setErrorMessage(errMessage);
      setShowErrorMessage(true);
    } finally {
      setButtonDisabled(false);
      setIsLoading(false);
      setEmail("");
      setShowSuccessMessage(true);
    }
  }

  useEffect(() => {
    if (isDialogVisible === false) {
      setShowSuccessMessage(false);
      setShowErrorMessage(false);
      setErrorMessage("");
    }
  }, [isDialogVisible]);

  return (
    <>
      {isDialogVisible && (
        <Dialog setDialogOpen={setDialogVisible} className={styles.dialog}>
          <div className={styles["dialog-content"]}>
            {showSuccessMessage && (
              <small onClick={() => setShowSuccessMessage(false)} className={styles["success-message"]}>
                &times; Invitation sent!
              </small>
            )}
            {showErrorMessage && (
              <Alert type="error">
                <AlertMessage>{errorMessage}</AlertMessage>
              </Alert>
            )}
            <form onSubmit={handleSumbit} className={styles["invite-form"]}>
              <Label htmlFor="email">Invite a researcher to the portal</Label>
              <Input
                type="email"
                id="email"
                placeholder="Email address"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                disabled={!(email.length > 6) || buttonDisabled}
                type="submit"
                cy="send-invite"
                className={styles["send-button"]}
              >
                {isLoading && (
                  <span className={styles.loader}>
                    <Loading message="" size="small" />
                  </span>
                )}
                Send Invitation
              </Button>{" "}
            </form>
          </div>
        </Dialog>
      )}

      <div className={styles.container}>
        <Button
          onClick={handleShowDialog}
          disabled={buttonDisabled}
          variant="secondary"
          cy="show-invite-input"
          type="button"
          size="small"
        >
          Invite external researcher
        </Button>
      </div>
    </>
  );
}
