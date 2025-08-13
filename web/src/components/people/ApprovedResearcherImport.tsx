import Button from "@/components/ui/Button";
import { postUsersApprovedResearchersImportCsv } from "@/openapi";
import { useRef, useState } from "react";
import styles from "./ApprovedResearcherImport.module.css";
import Loading from "../ui/Loading";
import Dialog from "../ui/Dialog";
import { Alert, AlertMessage } from "../shared/exports";

export default function ApprovedResearcherImport() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isDialogVisible, setDialogVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [buttonText, setButtonText] = useState("Upload");

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await postUsersApprovedResearchersImportCsv({
        body: files[0],
      });
      if (response.error) {
        console.log(response.error);
        setErrorMessage(`Failed with a ${response.response.status}`);
      } else {
        setButtonText("Imported ✔");
      }
    } catch (error) {
      console.log(error);
      setErrorMessage("Failed");
    }
    setIsLoading(false);
  }

  function handleSumbit(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (inputRef && inputRef.current) {
      inputRef.current.click();
    }
  }

  return (
    <>
      {isDialogVisible && (
        <Dialog setDialogOpen={setDialogVisible} className={styles.dialog}>
          <div className={styles["dialog-content"]}>
            {errorMessage && (
              <Alert type="error">
                <AlertMessage>{errorMessage}</AlertMessage>
              </Alert>
            )}
            <form>
              <p className={styles.helptext}>
                Upload a .csv file (
                <a href="https://github.com/ucl-arc-tre/portal/blob/cb4aaae44f270a943332b204adeafd73c23399a0/api.web.yaml#L156-L159">
                  format
                </a>
                ) containing approved researchers.
              </p>
              <input ref={inputRef} aria-label="file" type="file" hidden onChange={handleFileUpload} />
              <Button disabled={isLoading} onClick={handleSumbit} type="submit" cy="send-invite">
                {isLoading && (
                  <span className={styles.loader}>
                    <Loading message="" size="small" />
                  </span>
                )}
                {buttonText}
              </Button>{" "}
            </form>
          </div>
        </Dialog>
      )}

      <Button
        onClick={() => setDialogVisible(true)}
        variant="secondary"
        cy="approved-researcher-import"
        type="button"
        size="small"
      >
        Import Approved Researchers
      </Button>
    </>
  );
}
