import { useEffect, useState } from "react";
import { Asset, Study } from "@/openapi";
import StepProgress from "../../ui/steps/StepProgress";
import StepArrow from "../../ui/steps/StepArrow";
import StudyAgreement from "./StudyAgreement";
import Assets from "../../assets/Assets";
import StudyAdminsAgreements from "./StudyAdminsAgreements";

type StudySetupStepsProps = {
  study: Study;
  assets: Asset[];
  setAssets: (assets: Asset[]) => void;
  setAssetContractsCompleted: (completed: boolean) => void;
  checkAssetManagementCompleted: (assets: Asset[]) => Promise<boolean>;
  onStepsComplete: () => void;
};

export default function StudySetupSteps({
  study,
  assets,
  setAssets,
  setAssetContractsCompleted,
  checkAssetManagementCompleted,
  onStepsComplete,
}: StudySetupStepsProps) {
  const [agreementCompleted, setAgreementCompleted] = useState(false);
  const [adminsAgreementsCompleted, setAdminsAgreementsCompleted] = useState(false);
  const hasAsset = assets.length > 0;
  const isComplete = agreementCompleted && adminsAgreementsCompleted && hasAsset;

  useEffect(() => {
    if (isComplete) onStepsComplete();
  }, [isComplete, onStepsComplete]);

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
    {
      id: "study-agreements",
      title: "Study Agreements",
      description: "Ensure all administrators have agreed to the study agreement",
      completed: adminsAgreementsCompleted,
      current: hasAsset && !adminsAgreementsCompleted,
    },
  ];

  return (
    <>
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

      {agreementCompleted && !hasAsset && (
        <Assets
          study={study}
          assets={assets}
          setAssets={setAssets}
          setAssetContractsCompleted={setAssetContractsCompleted}
          checkAssetManagementCompleted={checkAssetManagementCompleted}
        />
      )}

      {agreementCompleted && hasAsset && !adminsAgreementsCompleted && (
        <StudyAdminsAgreements
          studyId={study.id}
          studyAdminUsernames={study.additional_study_admin_usernames}
          completed={adminsAgreementsCompleted}
          setCompleted={setAdminsAgreementsCompleted}
        />
      )}
    </>
  );
}
