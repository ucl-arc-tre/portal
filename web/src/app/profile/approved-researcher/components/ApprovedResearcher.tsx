"use client";

import { useAuth } from "../../../hooks/useAuth";
import LoginFallback from "@/components/ui/LoginFallback";
import ApprovedResearcherForm from "./ApprovedResearcherForm";
import AgreementText from "./AgreementText";
import { Agreement, getAgreementsApprovedResearcher } from "@/openapi";
import { useEffect, useState } from "react";

export default function ApprovedResearcher() {
  const { isAuthed } = useAuth();
  const [agreement, setAgreement] = useState<Agreement | null>(null);

  useEffect(() => {
    const fetchAgreement = async () => {
      try {
        const res = await getAgreementsApprovedResearcher();

        if (res.response.status === 200 && res.data) {
          setAgreement(res.data);
        }
      } catch (err) {
        console.error("Agreement fetch error:", err);
      }
    };

    if (isAuthed) {
      fetchAgreement();
    }
  }, [isAuthed]);

  if (!isAuthed) return <LoginFallback />;

  return (
    agreement && (
      <>
        <AgreementText text={agreement?.text} />
        <ApprovedResearcherForm agreementId={agreement.id} />
      </>
    )
  );
}
