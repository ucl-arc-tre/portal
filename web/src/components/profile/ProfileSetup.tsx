import ProfileChosenName from "./approved-researcher-components/ChosenName";
import ApprovedResearcherAgreement from "./approved-researcher-components/ApprovedResearcherAgreement";
import TrainingCertificate from "./approved-researcher-components/TrainingCertificate";
import StepArrow from "../ui/steps/StepArrow";
import StepProgress from "../ui/steps/StepProgress";
import { Auth } from "@/openapi";

import styles from "./ProfileSetup.module.css";

type Props = {
  chosenName: string | undefined;
  setChosenName: (name: string) => void;
  agreementCompleted: boolean;
  setAgreementCompleted: (completed: boolean) => void;
  trainingCertificateCompleted: boolean;
  setTrainingCertificateCompleted: (completed: boolean) => void;
  userData: Auth | null;
};

export default function ProfileSetup(props: Props) {
  const {
    chosenName,
    setChosenName,
    agreementCompleted,
    setAgreementCompleted,
    trainingCertificateCompleted,
    setTrainingCertificateCompleted,
  } = props;

  const hasChosenName = !!chosenName;
  const profileStepsCompleted = hasChosenName && agreementCompleted && trainingCertificateCompleted;

  const profileSetupSteps: Step[] = [
    {
      id: "chosen-name",
      title: "Set Your Chosen Name",
      description: "Enter your preferred name - this must match the name on your training certificate",
      completed: hasChosenName,
      current: !hasChosenName,
    },
    {
      id: "agreement",
      title: "Approved Researcher Agreement",
      description: "Review and accept the terms to become an approved researcher",
      completed: agreementCompleted,
      current: hasChosenName && !agreementCompleted,
    },
    {
      id: "certificate",
      title: "Training Certificate",
      description: "Upload your NHS Digital Data Security Awareness certificate",
      completed: trainingCertificateCompleted,
      current: hasChosenName && agreementCompleted && !trainingCertificateCompleted,
    },
  ];

  const getCurrentStepComponent = () => {
    if (!hasChosenName) {
      return <ProfileChosenName currentName={chosenName} setChosenName={setChosenName} />;
    }

    if (hasChosenName && !(agreementCompleted && trainingCertificateCompleted)) {
      return (
        <div className={styles["approved-researcher-steps"]}>
          <ApprovedResearcherAgreement
            setAgreementCompleted={setAgreementCompleted}
            agreementCompleted={agreementCompleted}
          />
          <TrainingCertificate setTrainingCertificateCompleted={setTrainingCertificateCompleted} />
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <StepProgress
        steps={profileSetupSteps}
        isComplete={profileStepsCompleted}
        completionTitle="Profile Complete!"
        completionSubtitle="You have successfully completed all profile setup steps and are now an approved researcher. You can now create and manage studies."
        completionButtonText="Go to studies"
        completionButtonHref="/studies"
        introText="Complete the following steps to set up your profile and become an approved researcher."
        ariaLabel="Profile setup progress"
      />

      {!profileStepsCompleted && <StepArrow />}

      <div className={styles["current-step"]}>{getCurrentStepComponent()}</div>
    </>
  );
}
