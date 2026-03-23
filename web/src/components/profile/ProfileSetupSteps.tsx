import { useEffect, useState } from "react";
import { Profile as ProfileData, UserAgreements, ProfileTraining } from "@/openapi";
import ProfileChosenName from "./approved-researcher-components/ChosenName";
import ApprovedResearcherAgreement from "./approved-researcher-components/ApprovedResearcherAgreement";
import TrainingCertificate from "./approved-researcher-components/TrainingCertificate";
import StepArrow from "../ui/steps/StepArrow";
import StepProgress from "../ui/steps/StepProgress";
import styles from "./ProfileSetupSteps.module.css";

type Props = {
  profileData: ProfileData;
  agreementsData: UserAgreements;
  trainingData: ProfileTraining;
  onStepsComplete: (chosenName: string) => void;
};

export default function ProfileSetupSteps({ profileData, agreementsData, trainingData, onStepsComplete }: Props) {
  const [chosenName, setChosenName] = useState(profileData.chosen_name);
  const [agreementCompleted, setAgreementCompleted] = useState(
    agreementsData.confirmed_agreements.some((a) => a.agreement_type === "approved-researcher")
  );
  const [trainingCertificateCompleted, setTrainingCertificateCompleted] = useState(
    trainingData.training_records.find((record) => record.kind === "training_kind_nhsd")?.is_valid || false
  );

  const hasChosenName = !!chosenName;
  const isComplete = hasChosenName && agreementCompleted && trainingCertificateCompleted;

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
      completed: trainingCertificateCompleted,
      current: hasChosenName && agreementCompleted && !trainingCertificateCompleted,
    },
  ];

  return (
    <>
      <StepProgress
        steps={steps}
        isComplete={isComplete}
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
