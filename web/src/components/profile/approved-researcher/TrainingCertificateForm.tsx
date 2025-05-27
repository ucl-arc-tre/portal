import Button from "@/components/ui/Button";
import LoginFallback from "@/components/ui/LoginFallback";
import { useAuth } from "@/hooks/useAuth";
import { postProfileTraining } from "@/openapi";
import { useState } from "react";
import styles from "./TrainingCertificateForm.module.css";

interface FormEvent extends React.FormEvent<HTMLFormElement> {
  target: HTMLFormElement;
}

export default function TrainingCertificateForm() {
  const { loading, isAuthed } = useAuth();
  const [isValid, setIsValid] = useState<boolean | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const { certificate } = e.target;
    const files: FileList = certificate.files;
    if (files.length != 1) {
      setErrorMessage("Must have only 1 file.");
      return;
    }
    const file = files[0];
    if (file.size > 1e7) {
      setErrorMessage("File must be < 10MB in size.");
      return;
    }
    base64Encode(file).then((content) => {
      if (content === null) {
        setErrorMessage("Failed to base64 encode PDF.");
        return;
      }
      try {
        postProfileTraining({
          body: {
            kind: "training_kind_nhsd",
            certficate_content_pdf_base64: content.replace("data:application/pdf;base64,", ""),
          },
        }).then((res) => {
          setErrorMessage("");
          setIsValid(res.data?.certificate_is_valid);
          if (res.error) {
            setErrorMessage(`Failed to validate certificate.`);
          }
        });
      } catch (err) {
        setErrorMessage(`Certificate training POST error: ${err}`);
      }
    });
  };

  if (loading) return null;

  if (!isAuthed) return <LoginFallback />;

  if (isValid) return <p>Valid training ✔</p>;

  return (
    <div id="training-certificate">
      <h2 className="subtitle">Training Certificate</h2>

      <form className={styles.wrapper} onSubmit={handleSubmit}>
        <input type="file" name="certificate" accept="pdf" required />
        <Button size="large" type="submit" id="training-certificate-sumbit">
          Submit
        </Button>
      </form>
      {errorMessage && (
        <p>
          {errorMessage}
          {"Please email "}
          <a
            href={`mailto:ig-training@ucl.ac.uk?body=${manualApprovalEmailBody}&subject=${manualApprovalEmailSubject}`}
          >
            ig-training@ucl.ac.uk
          </a>
          {" for manual approval."}
        </p>
      )}
    </div>
  );
}

function base64Encode(file: File): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);

    fileReader.onload = () => {
      resolve(fileReader.result as string | null);
    };

    fileReader.onerror = (error) => {
      reject(error);
    };
  });
}

const manualApprovalEmailBody = encodeURI("Dear UCL Information Governance,\n\n ...");

const manualApprovalEmailSubject = "Training certificate";
