import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { Input, Alert, AlertMessage, Label } from "../shared/uikitExports";
import styles from "./ExternalInvite.module.css";
import { postUsersInvite } from "@/openapi";
import { extractErrorMessage } from "@/lib/errorHandler";
import Loading from "@/components/ui/Loading";
import Dialog from "../ui/Dialog";

export default function ExternalInvite() {
  const [isDialogVisible, setDialogVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setIsLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      const response = await postUsersInvite({ body: { email } });
      if (!response.response.ok) {
        const errorMsg = extractErrorMessage(response);
        setErrorMessage(errorMsg);
        return;
      }
      setSuccessMessage("Invite sent");
      setEmail("");
    } catch (err) {
      console.error("Invite post error:", err);
      setErrorMessage("Failed to send invitation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (isDialogVisible === false) {
      setSuccessMessage("");
      setErrorMessage("");
    }
  }, [isDialogVisible]);

  return (
    <>
      {isDialogVisible && (
        <Dialog setDialogOpen={setDialogVisible}>
          <form onSubmit={handleSubmit} className={styles["invite-form"]}>
            <Label htmlFor="email">Invite a researcher to the portal</Label>
            <Input
              type="email"
              id="email"
              placeholder="Email address"
              name="email"
              required={true}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
            <Button disabled={isLoading} type="submit" cy="send-invite" className={styles["send-button"]}>
              {isLoading && (
                <span className={styles.loader}>
                  <Loading message="" size="small" />
                </span>
              )}
              Send Invitation
            </Button>{" "}
            {(errorMessage || successMessage) && (
              <Alert type={errorMessage ? "error" : "success"}>
                <AlertMessage>{errorMessage || successMessage}</AlertMessage>
              </Alert>
            )}
          </form>
        </Dialog>
      )}

      <Button
        onClick={() => setDialogVisible(true)}
        variant="secondary"
        cy="show-invite-input"
        type="button"
        size="small"
      >
        Invite external researcher
      </Button>
    </>
  );
}
