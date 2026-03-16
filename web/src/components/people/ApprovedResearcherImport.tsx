import Button from "@/components/ui/Button";
import { postUsersApprovedResearchersImportCsv } from "@/openapi";
import { extractErrorMessage } from "@/lib/errorHandler";
import { useRef, useState } from "react";
import styles from "./ApprovedResearcherImport.module.css";
import Loading from "../ui/Loading";
import Dialog from "../ui/Dialog";
import { Alert, AlertMessage } from "../shared/uikitExports";

export default function ApprovedResearcherImport() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isDialogVisible, setDialogVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    setSuccessMessage("");
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await postUsersApprovedResearchersImportCsv({
        body: files[0],
        bodySerializer: (b) => {
          return b; // noop serialisation for blob
        },
      });
      if (!response.response.ok) {
        const errorMsg = extractErrorMessage(response);
        setErrorMessage(errorMsg);
      } else {
        setSuccessMessage("Imported successfully");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to upload approved researchers. Please try again.");
    }
    setIsLoading(false);
  }

  function handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (inputRef && inputRef.current) {
      inputRef.current.click();
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
          <div className={styles["dialog-content"]}>
            <form>
              <p className={styles.helptext}>
                Upload a .csv file (
                <a href="https://github.com/ucl-arc-tre/portal/blob/cb4aaae44f270a943332b204adeafd73c23399a0/api.web.yaml#L156-L159">
                  format
                </a>
                ) containing approved researchers.
              </p>
              <input ref={inputRef} aria-label="file" type="file" accept=".csv" hidden onChange={handleFileUpload} />
              <Button disabled={isLoading} onClick={handleSubmit} type="submit" cy="approved-researcher-upload">
                {isLoading && (
                  <span className={styles.loader}>
                    <Loading message="" size="small" />
                  </span>
                )}
                Upload
              </Button>
              {(errorMessage || successMessage) && (
                <Alert type={errorMessage ? "error" : "success"}>
                  <AlertMessage>{errorMessage || successMessage}</AlertMessage>
                </Alert>
              )}
            </form>
          </div>
        </Dialog>
      )}

      <Button onClick={openDialog} variant="secondary" cy="approved-researcher-import" type="button" size="small">
        Import Approved Researchers
      </Button>
    </>
  );
}
