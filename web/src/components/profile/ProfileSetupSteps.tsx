import { useEffect, useState } from "react";
import ProfileChosenName from "./approved-researcher-components/ChosenName";
import ApprovedResearcherAgreement from "./approved-researcher-components/ApprovedResearcherAgreement";
import TrainingCertificate from "./approved-researcher-components/TrainingCertificate";
import StepArrow from "../ui/steps/StepArrow";
import StepProgress from "../ui/steps/StepProgress";
import styles from "./Profile.module.css";

type Props = {
  initialChosenName: string;
  initialAgreementCompleted: boolean;
  initialTrainingCompleted: boolean;
  expiryUrgency: ExpiryUrgency | null;
  onStepsComplete: (chosenName: string) => void;
};

export default function ProfileSetupSteps({
  initialChosenName,
  initialAgreementCompleted,
  initialTrainingCompleted,
  expiryUrgency,
  onStepsComplete,
}: Props) {
  const [chosenName, setChosenName] = useState(initialChosenName);
  const [agreementCompleted, setAgreementCompleted] = useState(initialAgreementCompleted);
  const [trainingCertificateCompleted, setTrainingCertificateCompleted] = useState(initialTrainingCompleted);

  const hasChosenName = !!chosenName;
  const isComplete = hasChosenName && agreementCompleted && trainingCertificateCompleted && !expiryUrgency;

  useEffect(() => {
    if (isComplete) onStepsComplete(chosenName);
  }, [isComplete, chosenName, onStepsComplete]);

  const steps: Step[] = [
    {
      id: "chosen-name",
      title: "Set Your Name",
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
      description: "Verify your NHS Digital Data Security Awareness certificate",
      completed: !expiryUrgency && trainingCertificateCompleted,
      current: hasChosenName && agreementCompleted,
      expiryUrgency: expiryUrgency,
    },
  ];

  const completionTitle = expiryUrgency
    ? expiryUrgency.level === "critical"
      ? "Your certificate has expired!"
      : "Your certificate is expiring soon!"
    : undefined;
  const completionSubtitle = expiryUrgency
    ? "To retain access to the portal, please verify a new certificate."
    : undefined;

  return (
    <>
      <StepProgress
        steps={steps}
        isComplete={isComplete}
        completionTitle={completionTitle}
        completionSubtitle={completionSubtitle}
        introText="Complete the following steps to set up your profile and become an approved researcher."
        ariaLabel="Profile setup progress"
      />
      <StepArrow />
      {!hasChosenName && <ProfileChosenName chosenName={chosenName} setChosenName={setChosenName} />}
      {hasChosenName && (
        <div className={styles["approved-researcher-steps"]}>
          <ApprovedResearcherAgreement
            setAgreementCompleted={setAgreementCompleted}
            agreementCompleted={agreementCompleted}
          />
          <TrainingCertificate setTrainingCertificateCompleted={setTrainingCertificateCompleted} />
        </div>
      )}
    </>
  );
}
