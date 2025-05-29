import { useState } from "react";

import styles from "./AgreementForm.module.css";
import { postProfileAgreements } from "@/openapi";
import Button from "@/components/ui/Button";
import dynamic from "next/dynamic";

const Input = dynamic(() => import("uikit-react-public").then((mod) => mod.Input), {
  ssr: false,
});
type ApprovedResearcherFormProps = {
  agreementId: string;
  setAgreementConfirmed: CallableFunction;
};

export default function ApprovedResearcherForm(props: ApprovedResearcherFormProps) {
  const { agreementId, setAgreementConfirmed } = props;
  const [submitted, setSubmitted] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      postProfileAgreements({ body: { agreement_id: agreementId } });
      setSubmitted(true);
      setAgreementConfirmed(true);
    } catch (err) {
      console.error("Agreement post error:", err);
    }
  };

  return (
    <div className={styles.wrapper}>
      {!submitted && (
        <form onSubmit={handleSubmit}>
          <Input
            className={styles.checkbox}
            type="checkbox"
            name="agreed"
            onChange={() => {
              setAgreed(!agreed);
            }}
            checked={agreed}
            required
          />
          I agree
          <Button size="large" type="submit" disabled={!agreed} cy="approved-researcher-agreement-agree">
            Submit
          </Button>
        </form>
      )}
    </div>
  );
}
