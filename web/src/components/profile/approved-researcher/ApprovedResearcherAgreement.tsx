import { useAuth } from "@/hooks/useAuth";
import LoginFallback from "@/components/ui/LoginFallback";
import AgreementForm from "./AgreementForm";
import AgreementText from "./AgreementText";
import { Agreement, getAgreementsApprovedResearcher, getProfileAgreements } from "@/openapi";
import { useEffect, useState } from "react";

export default function ApprovedResearcherAgreement() {
  const { loading, isAuthed } = useAuth();
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [agreementConfirmed, setAgreementConfirmed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
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
      }
    };

    if (isAuthed) {
      fetchData();
    }
  }, [isAuthed]);

  if (loading) return null;

  if (!isAuthed) return <LoginFallback />;

  if (agreementConfirmed)
    return (
      <div data-cy="approved-researcher-agreement">
        <p>Agreement confirmed ✔</p>
      </div>
    );

  return (
    !agreementConfirmed &&
    agreement && (
      <div data-cy="approved-researcher-agreement">
        <AgreementText text={agreement.text} />
        <AgreementForm agreementId={agreement.id} setAgreementConfirmed={setAgreementConfirmed} />
      </div>
    )
  );
}
