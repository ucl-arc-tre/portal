import { useEffect, useState } from "react";
import { Agreement, getAgreementsByAgreementType, getProfileAgreements, postProfileAgreements } from "@/openapi";
import { extractErrorMessage } from "@/lib/errorHandler";
import { useAuth } from "@/hooks/useAuth";
import LoginFallback from "@/components/ui/LoginFallback";
import AgreementForm from "../../ui/agreements/AgreementForm";
import AgreementText from "../../ui/agreements/AgreementText";
import Box from "@/components/ui/Box";

type ApprovedResearcherAgreementProps = {
  setAgreementCompleted: (completed: boolean) => void;
  agreementCompleted: boolean;
};

export default function ApprovedResearcherAgreement(props: ApprovedResearcherAgreementProps) {
  const { setAgreementCompleted, agreementCompleted } = props;

  const { authInProgress, isAuthed } = useAuth();
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [isLoadingAgreement, setIsLoadingAgreement] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingAgreement(true);
      try {
        setError(null);

        const agreementResult = await getAgreementsByAgreementType({ path: { agreementType: "approved-researcher" } });
        if (!agreementResult.response.ok || !agreementResult.data) {
          const errorMsg = extractErrorMessage(agreementResult);
          setError(`Failed to load agreement: ${errorMsg}`);
          return;
        }
        setAgreement(agreementResult.data);

        const profileAgreementsResult = await getProfileAgreements();
        if (!profileAgreementsResult.response.ok || !profileAgreementsResult.data) {
          const errorMsg = extractErrorMessage(profileAgreementsResult);
          setError(`Failed to load profile agreements: ${errorMsg}`);
          return;
        }

        const confirmedAgreements = profileAgreementsResult.data.confirmed_agreements;
        const isConfirmed = confirmedAgreements.some((agreement) => agreement.agreement_type == "approved-researcher");

        if (isConfirmed) {
          setAgreementCompleted(true);
        }
      } catch (err) {
        console.error("Failed to load agreement data:", err);
        setError("Failed to load agreement data. Please try again later.");
      } finally {
        setIsLoadingAgreement(false);
      }
    };

    if (isAuthed) {
      fetchData();
    }
  }, [isAuthed, setAgreementCompleted]);

  if (authInProgress || isLoadingAgreement) return null;

  if (error)
    return (
      <div className="error-message">
        <strong>Error:</strong> {error}
      </div>
    );

  if (!agreement) return <div>No agreements could be found.</div>;

  if (!isAuthed) return <LoginFallback />;

  // allow the user to show/hide the agreement if they want to see it again?
  if (agreementCompleted) return null;

  const handleAgreementSubmit = async (agreementId: string) => {
    const response = await postProfileAgreements({ body: { agreement_id: agreementId } });
    if (!response.response.ok) {
      const errorMsg = extractErrorMessage(response);
      throw new Error(errorMsg);
    }
  };

  return (
    agreement && (
      <section data-cy="approved-researcher-agreement">
        <Box>
          <h2 className="subtitle">Approved Researcher Agreement</h2>
          <AgreementText text={agreement.text} />

          <AgreementForm
            agreementId={agreement.id}
            setAgreementCompleted={setAgreementCompleted}
            handleAgreementSubmit={handleAgreementSubmit}
            timerSeconds={Number(process.env.NEXT_PUBLIC_AGREEMENT_TIMER_SECONDS)}
            confirmationText="I confirm that I have read and agree to the terms of the above agreement."
          />
        </Box>
      </section>
    )
  );
}
