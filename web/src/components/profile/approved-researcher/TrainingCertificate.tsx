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
const Input = dynamic(() => import("uikit-react-public").then((mod) => mod.Input), {
  ssr: false,
});

interface FormEvent extends React.FormEvent<HTMLFormElement> {
  target: HTMLFormElement & {
    certificate: HTMLInputElement;
  };
}

export default function TrainingCertificate() {
  const { authInProgress, isAuthed } = useAuth();
  const [isValid, setIsValid] = useState<boolean | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [errorType, setErrorType] = useState<AlertType>("warning");
  const [isPDF, setIsPDF] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(undefined);

    const { certificate } = e.target;
    const files: FileList | null = certificate.files;

    if (!files || files.length !== 1) {
      setErrorMessage("Must have only 1 file.");
      setErrorType("warning");
      setIsSubmitting(false);
      return;
    }

    const file = files[0];

    if (file.size > 1e7) {
      setErrorMessage("File must be < 10MB in size.");
      setErrorType("warning");
      setIsSubmitting(false);
      return;
    }

    try {
      const content = await base64Encode(file);
      if (!content) {
        setErrorMessage("Failed to encode PDF.");
        setErrorType("error");
        setIsSubmitting(false);
        return;
      }

      const res = await postProfileTraining({
        body: {
          kind: "training_kind_nhsd",
          certificate_content_pdf_base64: content.replace("data:application/pdf;base64,", ""),
        },
      });

      const isValidCert = res.data?.certificate_is_valid;
      setIsValid(isValidCert);

      if (res.error) {
        setErrorMessage("Failed to validate certificate.");
        setErrorType("error");
      } else if (!isValidCert) {
        setErrorMessage(`Certificate was not valid. ${res.data?.certificate_message || ""}`);
        setErrorType("error");
      } else {
        setErrorMessage("");
      }
    } catch (err) {
      setErrorMessage(`Certificate upload failed: ${err instanceof Error ? err.message : "Unknown error"}`);
      setErrorType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkIsPDF = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setIsPDF(false);
      setErrorMessage("");
      return;
    }

    const type = file.type;
    const typeIsPDF = type === "application/pdf";

    setIsPDF(typeIsPDF);

    if (typeIsPDF) {
      setErrorMessage("");
      setErrorType("warning");
    } else {
      setErrorMessage("Please select a valid PDF file to upload.");
      setErrorType("warning");
    }
  };

  if (authInProgress) return null;

  if (!isAuthed) return <LoginFallback />;

  if (isValid) {
    return (
      <Alert type="success">
        <AlertMessage>Valid training ✔</AlertMessage>
      </Alert>
    );
  }

  return (
    <section data-cy="training-certificate" className={styles.wrapper}>
      <h2 className="subtitle">Training Certificate</h2>
      <p>
        All members of UCL who manage highly confidential research information must undertake annual training on
        handling sensitive information. Anyone with an &apos;.ac.uk&apos; or NHS email address can self-register for{" "}
        <a href="https://www.e-lfh.org.uk/programmes/data-security-awareness/">
          NHS Digital Data Security Awareness Level 1 course
        </a>{" "}
        provided by e-Learning for Health. When asked, you can register your role as a &quot;Further Education and
        Higher Education Researcher (Education)&quot; which should provide you access to the course.
        <br />
        <br />
        <strong>Please complete the course and upload the PDF certificate below</strong>
      </p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <Input
          type="file"
          name="certificate"
          aria-label="certificate-upload"
          accept="application/pdf"
          required
          onChange={checkIsPDF}
        />
        <Button size="large" type="submit" cy="training-certificate-sumbit" disabled={!isPDF || isSubmitting}>
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
