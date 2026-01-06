import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import styles from "./AgreementForm.module.css";
import dynamic from "next/dynamic";
const Alert = dynamic(() => import("uikit-react-public").then((mod) => mod.Alert), {
  ssr: false,
});

const confirmationTextDefault = "By clicking agree, I confirm that I have read and understood the agreement.";

type AgreementFormProps = {
  agreementId: string;
  setAgreementCompleted: (completed: boolean) => void;
  handleAgreementSubmit: (agreementId: string) => Promise<void>;
  confirmationText?: string;
};

export default function AgreementForm(props: AgreementFormProps) {
  const {
    agreementId,
    setAgreementCompleted,
    handleAgreementSubmit,
    confirmationText = confirmationTextDefault,
  } = props;

  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(Number(process.env.NEXT_PUBLIC_AGREEMENT_TIMER_SECONDS));
  const canAgree = secondsRemaining === 0;

  useEffect(() => {
    if (secondsRemaining === 0) return;

    const timer = setTimeout(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsRemaining]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await handleAgreementSubmit(agreementId);
      setAgreed(true);
      setAgreementCompleted(true);
    } catch (err) {
      console.error("Agreement post error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles["agreement-form-container"]}>
      <Alert type="info">
        Please <strong>read the above agreement carefully</strong>.{" "}
        {canAgree ? "You can now agree." : <>Agreement possible in {secondsRemaining} seconds.</>}
      </Alert>

      <p className={styles["confirmation-text"]}>{confirmationText}</p>

      {!agreed && (
        <form onSubmit={handleSubmit}>
          <Button
            size="large"
            type="submit"
            disabled={!canAgree || isSubmitting}
            cy="agreement-agree"
            aria-label={`I agree to the above agreement`}
          >
            {isSubmitting ? "Submitting..." : "I Agree"}
          </Button>
        </form>
      )}
    </div>
  );
}
