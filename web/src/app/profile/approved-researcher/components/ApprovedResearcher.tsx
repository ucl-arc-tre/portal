"use client";

import { useAuth } from "../../../hooks/useAuth";
import LoginFallback from "@/components/ui/LoginFallback";
import ApprovedResearcherForm from "./ApprovedResearcherForm";
import AgreementText from "./AgreementText";

export default function ApprovedResearcher() {
  const { isAuthed } = useAuth();

  if (!isAuthed) return <LoginFallback />;

  return (
    <>
      <AgreementText />
      <ApprovedResearcherForm />
    </>
  );
}
