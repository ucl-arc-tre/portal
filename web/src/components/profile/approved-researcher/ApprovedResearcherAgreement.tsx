import { useEffect, useState } from "react";
import { Agreement, getAgreementsTextApprovedResearcher } from "@/openapi";
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
  const [agreementText, setAgreementText] = useState<Agreement | null>(null);
  const [isLoadingAgreement, setIsLoadingAgreement] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingAgreement(true);
      try {
        const agreementTextResponse = await getAgreementsTextApprovedResearcher();

        if (agreementTextResponse.response.status === 200 && agreementTextResponse.data) {
          setAgreementText(agreementTextResponse.data);
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

  if (!agreementText) return <div>No agreements could be found.</div>;

  if (!isAuthed) return <LoginFallback />;

  // allow the user to show/hide the agreement if they want to see it again?
  if (agreementCompleted) return null;

  return (
    agreementText && (
      <section data-cy="approved-researcher-agreement">
        <h2 className="subtitle">Approved Researcher Agreement</h2>
        <AgreementText text={agreementText.text} />

        <AgreementForm agreementId={agreementText.id} setAgreementCompleted={setAgreementCompleted} />
      </section>
    )
  );
}
