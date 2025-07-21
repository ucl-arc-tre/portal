import { useState, useEffect } from "react";
import { postProfileAgreements } from "@/openapi";
import Button from "@/components/ui/Button";
import styles from "./AgreementForm.module.css";
import dynamic from "next/dynamic";
import { approvedAgreementRequiredReadingSeconds } from "@/config";
const Alert = dynamic(() => import("uikit-react-public").then((mod) => mod.Alert), {
  ssr: false,
});

type ApprovedResearcherFormProps = {
  agreementId: string;
  setAgreementCompleted: (completed: boolean) => void;
};

export default function ApprovedResearcherForm(props: ApprovedResearcherFormProps) {
  const { agreementId, setAgreementCompleted } = props;
  const [agreed, setAgreed] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(approvedAgreementRequiredReadingSeconds);
  const canAgree = secondsRemaining === 0;

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((secondsRemaining) => {
        if (secondsRemaining === 0) {
          clearInterval(timer);
          return 0;
        }
        return secondsRemaining - 1;
      });
    }, 1000);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      postProfileAgreements({ body: { agreement_id: agreementId } });
      setAgreed(true);
      setAgreementCompleted(true);
    } catch (err) {
      console.error("Agreement post error:", err);
    }
  };

  return (
    <div className={styles.wrapper}>
      {!canAgree && (
        <Alert type="info">
          Please read this agreement carefully. Agreement possible in {secondsRemaining} seconds.
        </Alert>
      )}
      {!agreed && (
        <form onSubmit={handleSubmit}>
          <Button size="large" type="submit" disabled={!canAgree} cy="approved-researcher-agreement-agree">
            I Agree
          </Button>
        </form>
      )}
    </div>
  );
}
