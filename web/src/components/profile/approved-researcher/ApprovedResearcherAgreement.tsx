import { useEffect, useState } from "react";
import { Agreement, getAgreementsApprovedResearcher, getProfileAgreements } from "@/openapi";
import { useAuth } from "@/hooks/useAuth";
import LoginFallback from "@/components/ui/LoginFallback";
import AgreementForm from "./AgreementForm";
import AgreementText from "./AgreementText";

type ApprovedResearcherAgreementProps = {
  setAgreementCompleted: (completed: boolean) => void;
  agreementCompleted: boolean;
};

export default function ApprovedResearcherAgreement(props: ApprovedResearcherAgreementProps) {
  const { setAgreementCompleted, agreementCompleted } = props;

  const { authInProgress, isAuthed } = useAuth();
  const [agreement, setAgreement] = useState<Agreement | null>(null);
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
          const isConfirmed = confirmedAgreements.some(
            (agreement) => agreement.agreement_type == "approved-researcher"
          );

          if (isConfirmed) {
            setAgreementCompleted(true);
          }
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
  }, [isAuthed, setAgreementCompleted]);

  if (authInProgress || isLoadingAgreement) return null;

  if (!agreement) return <div>No agreements could be found.</div>;

  if (!isAuthed) return <LoginFallback />;

  // allow the user to show/hide the agreement if they want to see it again?
  if (agreementCompleted) return null;

  return (
    agreement && (
      <section data-cy="approved-researcher-agreement">
        <h2 className="subtitle">Approved Researcher Agreement</h2>
        <AgreementText text={agreement.text} />

        <AgreementForm agreementId={agreement.id} setAgreementCompleted={setAgreementCompleted} />
      </section>
    )
  );
}
