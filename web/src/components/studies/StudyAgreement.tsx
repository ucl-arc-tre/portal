import { useEffect, useState } from "react";
import {
  Agreement,
  getAgreementsByAgreementType,
  getStudiesByStudyIdAgreements,
  postStudiesByStudyIdAgreements,
} from "@/openapi";
import AgreementForm from "@/components/ui/agreements/AgreementForm";
import AgreementText from "@/components/ui/agreements/AgreementText";
import styles from "./StudyAgreement.module.css";
import { useAuth } from "@/hooks/useAuth";

type StudyAgreementProps = {
  studyId: string;
  studyTitle: string;
  agreementCompleted: boolean;
  setAgreementCompleted: (completed: boolean) => void;
};

export default function StudyAgreement(props: StudyAgreementProps) {
  const { studyId, studyTitle, agreementCompleted, setAgreementCompleted } = props;

  const [studyAgreementText, setStudyAgreementText] = useState<Agreement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshAuth, userData } = useAuth();

  useEffect(() => {
    const fetchStudyAgreementData = async () => {
      setIsLoading(true);

      try {
        setError(null);
        const agreementTextResult = await getAgreementsByAgreementType({ path: { agreementType: "study-owner" } });
        if (agreementTextResult.response.status === 200 && agreementTextResult.data) {
          setStudyAgreementText(agreementTextResult.data);
        } else {
          setError("Failed to load study agreement text. Please try again later.");
          return;
        }

        // Check if the user has already accepted the study agreement
        const studyAgreementsResult = await getStudiesByStudyIdAgreements({ path: { studyId } });
        if (studyAgreementsResult.response.status == 200 && studyAgreementsResult.data) {
          const confirmedAgreements = studyAgreementsResult.data.usernames;
          const isConfirmed = userData?.username && confirmedAgreements.includes(userData?.username);

          if (isConfirmed) {
            setAgreementCompleted(true);
          }
        } else {
          setError("Failed to load study agreements. Please try again later.");
          return;
        }
      } catch (err) {
        console.error("Failed to load study agreement:", err);
        setError("Failed to load study agreement. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudyAgreementData();
  }, [studyId, setAgreementCompleted, userData]);

  if (isLoading) return null;

  if (!studyAgreementText) return <div>No study agreement could be found.</div>;

  if (agreementCompleted) return null;

  const handleAgreementSubmit = async (agreementId: string) => {
    try {
      setError(null);

      const response = await postStudiesByStudyIdAgreements({
        path: { studyId },
        body: { agreement_id: agreementId },
      });

      if (response.response.status !== 200) {
        throw new Error("Failed to submit study agreement");
      } else refreshAuth();
    } catch (err) {
      setError("Failed to submit agreement. Please try again.");
      throw err;
    }
  };

  return (
    <section className={styles["study-agreement-container"]} data-cy="study-agreement">
      <h2 className="subtitle">Study Owner Agreement for study: {studyTitle}</h2>

      {error && (
        <div className={"error-message"}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <AgreementText text={studyAgreementText.text} />
      <AgreementForm
        agreementId={studyAgreementText.id}
        setAgreementCompleted={setAgreementCompleted}
        handleAgreementSubmit={handleAgreementSubmit}
        confirmationText={`By clicking 'I Agree' below I confirm that I am the Information Asset Owner in UCL of the following study: ${studyTitle}`}
      />
    </section>
  );
}
