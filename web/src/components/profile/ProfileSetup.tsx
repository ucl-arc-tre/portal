import ProfileChosenName from "./approved-researcher-components/ChosenName";
import ApprovedResearcherAgreement from "./approved-researcher-components/ApprovedResearcherAgreement";
import TrainingCertificate from "./approved-researcher-components/TrainingCertificate";
import StepArrow from "../ui/steps/StepArrow";
import StepProgress from "../ui/steps/StepProgress";
import { Auth } from "@/openapi";

import styles from "./ProfileSetup.module.css";
import Button from "../ui/Button";
import { useEffect, useState } from "react";

type Props = {
  chosenName: string | undefined;
  setChosenName: (name: string) => void;
  agreementCompleted: boolean;
  setAgreementCompleted: (completed: boolean) => void;
  trainingCertificateCompleted: boolean;
  setTrainingCertificateCompleted: (completed: boolean) => void;
  userData: Auth | null;
  expiryUrgency: ExpiryUrgency | null;
  refreshAuth: () => Promise<void>;
};

export default function ProfileSetup(props: Props) {
  const {
    chosenName,
    setChosenName,
    agreementCompleted,
    setAgreementCompleted,
    trainingCertificateCompleted,
    setTrainingCertificateCompleted,
    userData,
    expiryUrgency,
    refreshAuth,
  } = props;

  const hasChosenName = !!chosenName;
  const profileStepsCompleted = hasChosenName && agreementCompleted && trainingCertificateCompleted;
  const [showCertReupload, setShowCertReupload] = useState(false);
  const [isCollapsing, setIsCollapsing] = useState(false);

  // is there a better way of doing this so we don't get the warning but don't get infinite loops if appeasing the warning?
  useEffect(() => {
    if (profileStepsCompleted) {
      refreshAuth();
    }
  }, [profileStepsCompleted, refreshAuth]);

  const profileSetupSteps: Step[] = [
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

  const toggleShowCertReupload = () => {
    // for smooth collapse
    if (showCertReupload) {
      setIsCollapsing(true);
      setTimeout(() => {
        setShowCertReupload(false);
        setIsCollapsing(false);
      }, 1900);
    } else {
      setShowCertReupload(true);
    }
  };

  return (
    <>
      {expiryUrgency ? (
        <StepProgress
          steps={profileSetupSteps}
          isComplete={profileStepsCompleted}
          completionTitle="Your certificate is expiring soon!"
          completionSubtitle=" To retain access to the portal, please verify a new certificate."
          ariaLabel="Profile setup progress"
        />
      ) : userData?.roles.includes("staff") ? (
        profileStepsCompleted && (
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
        )
      ) : (
        <StepProgress
          steps={profileSetupSteps}
          isComplete={profileStepsCompleted}
          completionTitle="Profile Complete!"
          completionSubtitle="You have successfully completed all profile setup steps and are now an approved researcher."
          introText="Complete the following steps to set up your profile and become an approved researcher."
          ariaLabel="Profile setup progress"
        />
      )}

      {/* profile complete & show option to upload another cert */}
      {profileStepsCompleted && (
        <div className={styles["reupload-option"]}>
          <p>
            Your current training certificate is within date, but you may update your certification at any time by
            uploading a new document.
          </p>
          <Button variant="secondary" size="small" onClick={toggleShowCertReupload}>
            {!showCertReupload ? "Verify another certificate" : "Cancel"}
          </Button>
          <div
            className={`${styles["certificate-container"]} ${
              isCollapsing
                ? styles["cert-collapsing"]
                : showCertReupload
                  ? styles["cert-visible"]
                  : styles["cert-hidden"]
            }`}
          >
            <TrainingCertificate setTrainingCertificateCompleted={setTrainingCertificateCompleted} />
          </div>
        </div>
      )}
      {!profileStepsCompleted && <StepArrow />}

      <div className={styles["current-step"]}>{getCurrentStepComponent()}</div>
    </>
  );
}
