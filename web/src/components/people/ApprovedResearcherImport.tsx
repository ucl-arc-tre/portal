import Button from "@/components/ui/Button";
import { importApprovedResearchersCsv } from "@/openapi";
import { useRef, useState } from "react";
import styles from "./ApprovedResearcherImport.module.css";

export default function ApprovedResearcherImport() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [buttonText, setButtonText] = useState("Import approved researchers");
  const [buttonDisabled, setButtonDisabled] = useState(false);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    setButtonDisabled(true);

    try {
      const response = await importApprovedResearchersCsv({
        body: files[0],
      });
      if (response.error) {
        console.error(response.error);
        setButtonText("Failed");
      } else {
        setButtonText("Imported ✔");
      }
    } catch (error) {
      console.error(error);
      setButtonText("Failed");
    }
  }

  function handleSumbit(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (inputRef && inputRef.current) {
      inputRef.current.click();
    }
  }

  return (
    <div>
      <form>
        <input ref={inputRef} type="file" hidden onChange={handleFileUpload} />
        <Button
          className={styles.button}
          onClick={handleSumbit}
          disabled={buttonDisabled}
          cy="approved-researcher-import"
        >
          {buttonText}
        </Button>
      </form>
      <p className={styles.helptext}>
        Upload a .csv file (
        <a href="https://github.com/ucl-arc-tre/portal/blob/cb4aaae44f270a943332b204adeafd73c23399a0/api.web.yaml#L156-L159">
          format
        </a>
        ) containing approved researchers.
      </p>
    </div>
  );
}
