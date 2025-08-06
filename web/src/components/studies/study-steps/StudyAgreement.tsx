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

type StudyAgreementProps = {
  studyId: string;
  agreementCompleted: boolean;
  setAgreementCompleted: (completed: boolean) => void;
};

export default function StudyAgreement(props: StudyAgreementProps) {
  const { studyId, agreementCompleted, setAgreementCompleted } = props;

  const [studyAgreementText, setStudyAgreementText] = useState<Agreement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          const confirmedAgreements = studyAgreementsResult.data.confirmed_agreements;
          const isConfirmed = confirmedAgreements.some((agreement) => agreement.agreement_type == "study-owner");

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
  }, [studyId, setAgreementCompleted]);

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
      }
    } catch (err) {
      setError("Failed to submit agreement. Please try again.");
      throw err;
    }
  };

  return (
    <section data-cy="study-agreement">
      <h2 className="subtitle">Study Owner Agreement</h2>

      {error && (
        <div className={styles["error-message"]}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <AgreementText text={studyAgreementText.text} />
      <AgreementForm
        agreementId={studyAgreementText.id}
        setAgreementCompleted={setAgreementCompleted}
        handleAgreementSubmit={handleAgreementSubmit}
        agreementLabel="the study owner agreement"
      />
    </section>
  );
}
