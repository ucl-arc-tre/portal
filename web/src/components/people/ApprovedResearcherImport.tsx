import Button from "@/components/ui/Button";
import { useRef, useState } from "react";

export default function ApprovedResearcherImport() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [buttonText, setButtonText] = useState("Import approved researchers");
  const [buttonDisabled, setButtonDisabled] = useState(false);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const file = files[0];

    // use the file
    console.log(file.name);
    setButtonText("Imported ✔");
    setButtonDisabled(true);
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
        <Button onClick={handleSumbit} disabled={buttonDisabled} cy="approved-researcher-import">
          {buttonText}
        </Button>
      </form>
    </div>
  );
}
