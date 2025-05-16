"use client";

import { useState } from "react";

import "./AgreementForm.css";
import { postProfileAgreements } from "@/openapi";

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
    <div className="form-container">
      {!submitted && (
        <form onSubmit={handleSubmit}>
          I agree
          <input
            type="checkbox"
            name="agreed"
            onChange={() => {
              setAgreed(!agreed);
            }}
            checked={agreed}
            className="input-checkbox"
            required
          />
          <button type="submit" className="submit-button">
            Submit
          </button>
        </form>
      )}
    </div>
  );
}
