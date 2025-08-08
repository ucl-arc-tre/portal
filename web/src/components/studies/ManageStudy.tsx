import { useState } from "react";
import { Study, Auth } from "@/openapi";
import StepProgress from "../ui/steps/StepProgress";
import StepArrow from "../ui/steps/StepArrow";
import StudyAgreement from "./study-steps/StudyAgreement";

type ManageStudyProps = {
  study: Study;
  userData: Auth;
};

export default function ManageStudy({ study }: ManageStudyProps) {
  const [agreementCompleted, setAgreementCompleted] = useState(false);

  const studyStepsCompleted = agreementCompleted;

  const studySteps: Step[] = [
    {
      id: "study-agreement",
      title: "Study Agreement",
      description: "Review and accept the study agreement terms",
      completed: agreementCompleted,
      current: !agreementCompleted,
    },
    {
      id: "study-asset",
      title: "Study Asset",
      description: "Create and manage at least one study asset",
      completed: false,
      current: agreementCompleted, // replace with actual asset management step logic
    },
  ];

  const getCurrentStepComponent = () => {
    return (
      <StudyAgreement
        studyId={study.id}
        studyTitle={study.title}
        agreementCompleted={agreementCompleted}
        setAgreementCompleted={setAgreementCompleted}
      />
    );
    // Todo: insert next step (asset creation)
  };

  return (
    <>
      <StepProgress
        steps={studySteps}
        isComplete={false}
        completionTitle="Study Setup Complete!"
        completionSubtitle="You have successfully completed all study setup steps."
        completionButtonText="Go to studies"
        completionButtonHref="/studies"
        introText="Complete the following steps to set up your study."
        ariaLabel="Study setup progress"
      />

      {!studyStepsCompleted && <StepArrow />}

      <div>{getCurrentStepComponent()}</div>
    </>
  );
}
