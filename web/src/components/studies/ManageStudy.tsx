import { useState } from "react";
import { Study, Auth } from "@/openapi";
import StepProgress from "../ui/steps/StepProgress";
import StepArrow from "../ui/steps/StepArrow";
import StudyAgreement from "./study-steps/StudyAgreement";
import StudyAssets from "./study-steps/StudyAssets";
import styles from "./ManageStudy.module.css";

type ManageStudyProps = {
  study: Study;
  userData: Auth;
};

export default function ManageStudy({ study }: ManageStudyProps) {
  const [agreementCompleted, setAgreementCompleted] = useState(false);
  const [assetManagementCompleted, setAssetManagementCompleted] = useState(false);

  const studyStepsCompleted = agreementCompleted && assetManagementCompleted;

  const studySteps: Step[] = [
    {
      id: "study-agreement",
      title: "Study Agreement",
      description: "Review and accept the study agreement terms",
      completed: agreementCompleted,
      current: !agreementCompleted,
    },
    {
      id: "study-assets",
      title: "Study Assets",
      description: "Create and manage at least one study asset",
      completed: assetManagementCompleted,
      current: agreementCompleted && !assetManagementCompleted,
    },
  ];

  const getCurrentStepComponent = () => {
    if (!agreementCompleted) {
      return (
        <StudyAgreement
          studyId={study.id}
          studyTitle={study.title}
          agreementCompleted={agreementCompleted}
          setAgreementCompleted={setAgreementCompleted}
        />
      );
    }

    if (!assetManagementCompleted) {
      return (
        <StudyAssets
          studyId={study.id}
          studyTitle={study.title}
          setAssetManagementCompleted={setAssetManagementCompleted}
        />
      );
    }
  };

  return (
    <>
      <StepProgress
        steps={studySteps}
        isComplete={studyStepsCompleted}
        completionTitle="Study Setup Complete!"
        completionSubtitle="You have successfully completed all study setup steps."
        completionButtonText="Go to studies"
        completionButtonHref="/studies"
        introText="Complete the following steps to set up your study."
        ariaLabel="Study setup progress"
      />

      {!studyStepsCompleted && <StepArrow />}

      {getCurrentStepComponent()}

      {studyStepsCompleted && (
        <div className={styles["completed-section"]}>
          <StudyAssets studyId={study.id} studyTitle={study.title} />
        </div>
      )}
    </>
  );
}
