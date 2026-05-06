import { useEffect, useState } from "react";
import { Agreement, getAgreementsByAgreementType, postStudiesByStudyIdAgreements } from "@/openapi";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";
import AgreementForm from "@/components/ui/agreements/AgreementForm";
import AgreementText from "@/components/ui/agreements/AgreementText";
import styles from "./StudyAgreement.module.css";
import { useAuth } from "@/hooks/useAuth";
import { AlertMessage, Alert } from "../../shared/uikitExports";
import Loading from "../../ui/Loading";

type StudyAgreementProps = {
  studyId: string;
  studyTitle: string;
  setAgreementCompleted: (completed: boolean) => void;
};

export default function StudyAgreement({ studyId, studyTitle, setAgreementCompleted }: StudyAgreementProps) {
  const [studyAgreementText, setStudyAgreementText] = useState<Agreement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshAuth, userData } = useAuth();
  const isIAO = userData?.roles.includes("information-asset-owner");

  useEffect(() => {
    const fetchAgreementText = async () => {
      setIsLoading(true);

      try {
        setError(null);
        const agreementTextResult = await getAgreementsByAgreementType({ path: { agreementType: "study-owner" } });
        if (responseIsError(agreementTextResult) || !agreementTextResult.data) {
          const errorMsg = extractErrorMessage(agreementTextResult);
          setError(`Failed to load study agreement text: ${errorMsg}`);
          return;
        }
        setStudyAgreementText(agreementTextResult.data);
      } catch (err) {
        console.error("Failed to load study agreement:", err);
        setError("Failed to load study agreement. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgreementText();
  }, []);

  if (isLoading) return <Loading message="Loading study agreement..." />;

  if (!studyAgreementText) return <div>No study agreement could be found.</div>;

  const handleAgreementSubmit = async (agreementId: string) => {
    try {
      setError(null);

      const response = await postStudiesByStudyIdAgreements({
        path: { studyId },
        body: { agreement_id: agreementId },
      });

      if (responseIsError(response)) {
        const errorMsg = extractErrorMessage(response);
        throw new Error(errorMsg);
      }
      refreshAuth();
    } catch (err) {
      setError("Failed to submit agreement. Please try again.");
      throw err;
    }
  };

  return (
    <section className={styles["study-agreement-container"]} data-cy="study-agreement">
      <h2 className="subtitle">Study Owner Agreement for study: {studyTitle}</h2>

      {error && (
        <Alert type="error">
          <AlertMessage>{error}</AlertMessage>
        </Alert>
      )}

      <AgreementText text={studyAgreementText.text} />
      <AgreementForm
        agreementId={studyAgreementText.id}
        setAgreementCompleted={setAgreementCompleted}
        handleAgreementSubmit={handleAgreementSubmit}
        timerSeconds={isIAO ? 1 : Number(process.env.NEXT_PUBLIC_AGREEMENT_TIMER_SECONDS)}
        confirmationText={`By clicking 'I Agree' below I confirm that I am the Information Asset Owner in UCL of the following study: ${studyTitle}`}
      />
    </section>
  );
}
