import { useEffect, useState } from "react";
import { Asset, Study, getStudiesByStudyIdAgreements } from "@/openapi";
import { extractErrorMessage } from "@/lib/errorHandler";
import StepProgress from "../../ui/steps/StepProgress";
import StepArrow from "../../ui/steps/StepArrow";
import StudyAgreement from "./StudyAgreement";
import Assets from "../../assets/Assets";
import Loading from "../../ui/Loading";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertMessage } from "../../shared/uikitExports";

type StudySetupStepsProps = {
  study: Study;
  assets: Asset[];
  setAssets: (assets: Asset[]) => void;
  onStepsComplete: () => void;
};

export default function StudySetupSteps({ study, assets, setAssets, onStepsComplete }: StudySetupStepsProps) {
  const [agreementCompleted, setAgreementCompleted] = useState(false);
  const [isCheckingAgreement, setIsCheckingAgreement] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userData } = useAuth();
  const hasAsset = assets.length > 0;
  const isComplete = agreementCompleted && hasAsset;

  useEffect(() => {
    if (isComplete) onStepsComplete();
  }, [isComplete, onStepsComplete]);

  useEffect(() => {
    const checkStudyAgreement = async () => {
      try {
        const result = await getStudiesByStudyIdAgreements({ path: { studyId: study.id } });
        if (!result.response.ok || !result.data) {
          const errorMsg = extractErrorMessage(result);
          setError(`Failed to load study agreements: ${errorMsg}`);
          return;
        }
        const isConfirmed = userData?.username && result.data.usernames.includes(userData.username);
        if (isConfirmed) setAgreementCompleted(true);
      } catch (error) {
        console.error("Failed to check study agreement:", error);
        setError("Failed to check study agreement. Please try again later.");
      } finally {
        setIsCheckingAgreement(false);
      }
    };

    checkStudyAgreement();
  }, [study.id, userData]);

  if (isCheckingAgreement) return <Loading message="Checking study setup..." />;

  const studySteps: Step[] = [
    {
      id: "study-agreement",
      title: "Study Agreement",
      description: "Review and accept the study agreement terms.",
      completed: agreementCompleted,
      current: !agreementCompleted,
    },
    {
      id: "study-assets",
      title: "Information Assets",
      description:
        "Create and manage at least one information asset. You can create more assets at any time. Note that contracts can also be attached to assets, in some cases this is required.",
      completed: hasAsset,
      current: !hasAsset,
    },
  ];

  return (
    <>
      {error && (
        <Alert type="error">
          <AlertMessage>{error}</AlertMessage>
        </Alert>
      )}

      <StepProgress
        steps={studySteps}
        isComplete={isComplete}
        introText="Complete the following steps to set up your study."
        ariaLabel="Study setup progress"
      />

      <StepArrow />

      {!agreementCompleted && (
        <StudyAgreement studyId={study.id} studyTitle={study.title} setAgreementCompleted={setAgreementCompleted} />
      )}

      {agreementCompleted && !hasAsset && <Assets study={study} assets={assets} setAssets={setAssets} />}
    </>
  );
}
