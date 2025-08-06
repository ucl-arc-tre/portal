import { Study, Auth } from "@/openapi";
import StepProgress from "../ui/steps/StepProgress";
import StepArrow from "../ui/steps/StepArrow";
import StudyAgreement from "./study-steps/StudyAgreement";

type ManageStudyProps = {
  study: Study;
  userData: Auth;
};

export default function ManageStudy({ study }: ManageStudyProps) {
  const studyStepsCompleted = false;

  const studySteps: Step[] = [
    {
      id: "study-agreement",
      title: "Study Agreement",
      description: "Review and accept the study agreement terms",
      completed: false,
      current: true,
    },
    {
      id: "study-asset",
      title: "Study Asset",
      description: "Create and manage at least one study asset",
      completed: false,
      current: false,
    },
  ];

  const getCurrentStepComponent = () => {
    return <StudyAgreement />;
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
