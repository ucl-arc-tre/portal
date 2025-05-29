import Button from "@/components/ui/Button";
import LoginFallback from "@/components/ui/LoginFallback";
import { useAuth } from "@/hooks/useAuth";
import { postProfileTraining } from "@/openapi";
import { ChangeEvent, useState } from "react";
import styles from "./TrainingCertificate.module.css";
import TrainingCertificateError from "./TrainingCertificateError";
import { AlertType } from "uikit-react-public/dist/components/Alert/Alert";

import dynamic from "next/dynamic";
const Alert = dynamic(() => import("uikit-react-public").then((mod) => mod.Alert), {
  ssr: false,
});
const AlertMessage = dynamic(() => import("uikit-react-public").then((mod) => mod.Alert.Message), {
  ssr: false,
});

interface FormEvent extends React.FormEvent<HTMLFormElement> {
  target: HTMLFormElement;
}

export default function TrainingCertificate() {
  const { loading, isAuthed } = useAuth();
  const [isValid, setIsValid] = useState<boolean | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [errorType, setErrorType] = useState<AlertType>("warning");
  const [isPDF, setIsPDF] = useState<boolean>(false);

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
        setErrorType("error");
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
            setErrorType("error");
          } else if (!isValid) {
            setErrorMessage("Certificate was not valid. " + res.data?.certificate_message);
            setErrorType("error");
          }
        });
      } catch (err) {
        setErrorMessage(`Certificate training POST error: ${err}`);
        setErrorType("error");
      }
    });
  };

  const checkIsPDF = (event: ChangeEvent<HTMLInputElement>) => {
    console.log("checking is pdf");
    const file = event.target.files![0];

    const type = file!.type;
    setIsPDF(type === "application/pdf");
    setErrorMessage("Please select a valid PDF file to upload.");
    return;
  };

  if (loading) return null;

  if (!isAuthed) return <LoginFallback />;

  if (isValid)
    return (
      <Alert type="success">
        <AlertMessage>Valid training ✔</AlertMessage>
      </Alert>
    );

  return (
    <section data-cy="training-certificate" className={styles.wrapper}>
      <h2 className="subtitle">Training Certificate</h2>
      <p>
        {
          "All members of UCL who manage highly confidential research information, must undertake annual training on handling sentitive information. Anyone with an '.ac.uk' or NHS email address can self-register for "
        }
        <a href="https://www.e-lfh.org.uk/programmes/data-security-awareness/">
          NHS Digital Data Security Awareness Level 1 course
        </a>
        {
          " provided by e-Learning for Health. When asked, you can register your role as a “Further Education and Higher Education Researcher (Education)” which should provide you access to the course. "
        }
        <br></br>
        <strong>Please complete the course and upload the PDF certificate below</strong>
      </p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input type="file" name="certificate" accept="pdf" required onChange={checkIsPDF} />
        <Button size="large" type="submit" cy="training-certificate-sumbit" disabled={!isPDF}>
          Submit
        </Button>
      </form>
      {errorMessage && (
        <Alert type={errorType}>
          <TrainingCertificateError text={errorMessage} showExtra={errorType === "error"} />
        </Alert>
      )}
    </section>
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
