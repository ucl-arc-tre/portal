"use client";

import { useState } from "react";

import "./AgreementForm.css";
import { postProfileAgreements } from "@/openapi";
import Button from "@/components/ui/Button";

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
    <div className="form form__wrapper">
      {!submitted && (
        <form onSubmit={handleSubmit}>
          <input
            type="checkbox"
            name="agreed"
            onChange={() => {
              setAgreed(!agreed);
            }}
            checked={agreed}
            required
          />
          I agree
          <Button size="large" type="submit" disabled={!agreed}>
            Submit
          </Button>
        </form>
      )}
    </div>
  );
}
