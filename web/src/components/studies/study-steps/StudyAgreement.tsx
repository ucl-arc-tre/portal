import { useEffect, useState } from "react";
import { Agreement, getAgreementsByAgreementType, postProfileAgreements } from "@/openapi";
import AgreementForm from "@/components/ui/agreements/AgreementForm";
import AgreementText from "@/components/ui/agreements/AgreementText";

type StudyAgreementProps = {
  agreementCompleted: boolean;
  setAgreementCompleted: (completed: boolean) => void;
};

export default function StudyAgreement(props: StudyAgreementProps) {
  const { agreementCompleted, setAgreementCompleted } = props;
  const [studyAgreementText, setStudyAgreementText] = useState<Agreement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStudyAgreementText = async () => {
      setIsLoading(true);

      try {
        const agreementTextResult = await getAgreementsByAgreementType({ path: { agreementType: "study-owner" } });
        if (agreementTextResult.response.status === 200 && agreementTextResult.data) {
          setStudyAgreementText(agreementTextResult.data);
        }

        // fetch the already completed agreements for the user to check if the study agreement is already completed
        // const profileAgreementsResult = await getProfileAgreements();
        // if (profileAgreementsResult.response.status == 200 && profileAgreementsResult.data) {
        //   const confirmedAgreements = profileAgreementsResult.data.confirmed_agreements;
        //   const isConfirmed = confirmedAgreements.some((agreement) => agreement.agreement_type == "study-owner");

        //   if (isConfirmed) {
        //     setAgreementCompleted(true);
        //   }
        // }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudyAgreementText();
  }, [setAgreementCompleted]);

  if (isLoading) return null;

  if (!studyAgreementText) return <div>No study agreement could be found.</div>;

  if (agreementCompleted) return null;

  const handleAgreementSubmit = async (agreementId: string) => {
    // TODO: change this to post study agreements
    await postProfileAgreements({ body: { agreement_id: agreementId } });
  };

  return (
    <section data-cy="study-agreement">
      <h2 className="subtitle">Study Owner Agreement</h2>
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
