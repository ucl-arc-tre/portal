import { useState, useEffect } from "react";
import { postProfileAgreements } from "@/openapi";
import Button from "@/components/ui/Button";
import styles from "./AgreementForm.module.css";
import dynamic from "next/dynamic";
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
  const [secondsRemaining, setSecondsRemaining] = useState(Number(process.env.NEXT_PUBLIC_AGREEMENT_TIMER));
  const canAgree = secondsRemaining === 0;

  useEffect(() => {
    if (secondsRemaining === 0) return;

    const timer = setTimeout(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsRemaining]);

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
      <Alert type="info">
        Please <strong>read this agreement carefully</strong>.{" "}
        {canAgree ? "You can now agree." : <>Agreement possible in {secondsRemaining} seconds.</>}
      </Alert>
      {!agreed && (
        <form onSubmit={handleSubmit}>
          <Button
            size="large"
            type="submit"
            disabled={!canAgree}
            cy="approved-researcher-agreement-agree"
            aria-label="I agree to the approved researcher agreement"
          >
            I Agree
          </Button>
        </form>
      )}
    </div>
  );
}
