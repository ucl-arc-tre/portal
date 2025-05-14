"use client";

import { useState } from "react";

import "./ApprovedResearcherForm.css";
import { postProfileAgreements } from "@/openapi";

export default function ApprovedResearcherForm({ agreementId }: { agreementId: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      postProfileAgreements({ body: { agreement_id: agreementId } });
      setSubmitted(true);
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
            className="input-field"
            required
          />
          <button type="submit" className="submit-button">
            Submit
          </button>
        </form>
      )}
      {submitted && (
        <div className="submitted-box">
          <p>Agreement confirmed</p>
        </div>
      )}
    </div>
  );
}
