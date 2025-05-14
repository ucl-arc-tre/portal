"use client";

import { useAuth } from "../../../hooks/useAuth";
import LoginFallback from "@/components/ui/LoginFallback";
import ApprovedResearcherForm from "./ApprovedResearcherForm";
import AgreementText from "./AgreementText";

export default function ApprovedResearcher() {
  const { loading, isAuthed } = useAuth();

  if (loading) return null;

  if (!isAuthed) return <LoginFallback />;

  return (
    <>
      <ApprovedResearcherForm />
      <AgreementText />
    </>
  );
}
