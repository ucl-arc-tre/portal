"use client";

import { useState } from "react";

import "./ApprovedResearcherForm.css";

export default function ApprovedResearcherForm() {
  const [submitted, setSubmitted] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
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
          <p>Form submitted! Data:</p>

          <pre>{JSON.stringify(agreed, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
