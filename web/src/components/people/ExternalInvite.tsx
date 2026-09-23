import Button from "@/components/ui/Button";
import { useState } from "react";
import { Input, Alert, AlertMessage, Label } from "../ui/uikitExports";
import styles from "./ExternalInvite.module.css";
import { postUsersInvite } from "@/openapi";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";
import Loading from "@/components/ui/Loading";
import Dialog from "../ui/Dialog";
import HelperBlock from "../ui/HelperBlock";

const helperText = `People tab will enable you to view researchers and collaborators associated with your project. You can also invite external researchers to collaborate on the project.

To invite an external researcher, select Invite External Researcher and enter their email address. The researcher will receive an email with instructions on how to access and collaborate on the project. `;

export default function ExternalInvite() {
  const [isDialogVisible, setDialogVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setIsLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      const response = await postUsersInvite({ body: { email } });
      if (responseIsError(response)) {
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

  function openDialog() {
    setSuccessMessage("");
    setErrorMessage("");
    setDialogVisible(true);
  }

  return (
    <>
      {isDialogVisible && (
        <Dialog setDialogOpen={setDialogVisible}>
          <h2>Invite a researcher to the portal</h2>
          <form onSubmit={handleSubmit} className={"form"}>
            <Label htmlFor="email">
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
            </Label>
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

      <HelperBlock text={helperText} />

      <Button onClick={openDialog} variant="secondary" cy="show-invite-input" type="button" size="small">
        Invite external researcher
      </Button>
    </>
  );
}
