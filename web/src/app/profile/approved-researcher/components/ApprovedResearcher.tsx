"use client";

import { useAuth } from "../../../hooks/useAuth";
import ApprovedResearcherForm from "./ApprovedResearcherForm";
import AgreementText from "./AgreementText";

export default function ApprovedResearcher() {
  const { isAuthed } = useAuth();

  if (!isAuthed) {
    return (
      <>
        <p>You must be logged in to view this page</p>
        <a href="/oauth2/start" className="btn--login" id="login" role="button">
          Login with UCL SSO
        </a>
      </>
    );
  }

  return (
    <>
      <ApprovedResearcherForm />
      <AgreementText />
    </>
  );
}
