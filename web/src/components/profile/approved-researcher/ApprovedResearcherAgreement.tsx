import { useAuth } from "@/hooks/useAuth";
import LoginFallback from "@/components/ui/LoginFallback";
import AgreementForm from "./AgreementForm";
import AgreementText from "./AgreementText";
import { Agreement, getAgreementsApprovedResearcher, getProfileAgreements } from "@/openapi";
import { useEffect, useState } from "react";

import dynamic from "next/dynamic";
const Alert = dynamic(() => import("uikit-react-public").then((mod) => mod.Alert), {
  ssr: false,
});
const AlertMessage = dynamic(() => import("uikit-react-public").then((mod) => mod.Alert.Message), {
  ssr: false,
});

export default function ApprovedResearcherAgreement() {
  const { authInProgress, isAuthed } = useAuth();
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [agreementConfirmed, setAgreementConfirmed] = useState(false);
  const [isLoadingAgreement, setIsLoadingAgreement] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingAgreement(true);
      try {
        const agreementResult = await getAgreementsApprovedResearcher();
        const profileAgreementsResult = await getProfileAgreements();
        if (agreementResult.response.status === 200 && agreementResult.data) {
          setAgreement(agreementResult.data);
        }
        if (profileAgreementsResult.response.status == 200 && profileAgreementsResult.data) {
          const confirmedAgreements = profileAgreementsResult.data.confirmed_agreements;
          setAgreementConfirmed(
            confirmedAgreements.some((agreement) => agreement.agreement_type == "approved-researcher")
          );
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoadingAgreement(false);
      }
    };

    if (isAuthed) {
      fetchData();
    }
  }, [isAuthed]);

  if (authInProgress || isLoadingAgreement) return null;

  if (!agreement) return <div>No agreements could be found.</div>;

  if (!isAuthed) return <LoginFallback />;

  if (agreementConfirmed)
    return (
      <section data-cy="approved-researcher-agreement">
        <Alert type="success">
          <AlertMessage>Agreement confirmed ✔</AlertMessage>
        </Alert>
      </section>
    );

  return (
    !agreementConfirmed &&
    agreement && (
      <section data-cy="approved-researcher-agreement">
        <h2 className="subtitle">Approved Researcher Agreement</h2>
        <AgreementText text={agreement.text} />
        <AgreementForm agreementId={agreement.id} setAgreementConfirmed={setAgreementConfirmed} />
      </section>
    )
  );
}
