import ProfileChosenName from "./approved-researcher-components/ChosenName";
import ApprovedResearcherAgreement from "./approved-researcher-components/ApprovedResearcherAgreement";
import TrainingCertificate from "./approved-researcher-components/TrainingCertificate";
import StepArrow from "../ui/steps/StepArrow";
import StepProgress from "../ui/steps/StepProgress";
import { Auth } from "@/openapi";

import styles from "./ProfileSetup.module.css";
import Button from "../ui/Button";
import { useState } from "react";

type Props = {
  chosenName: string | undefined;
  setChosenName: (name: string) => void;
  agreementCompleted: boolean;
  setAgreementCompleted: (completed: boolean) => void;
  trainingCertificateCompleted: boolean;
  setTrainingCertificateCompleted: (completed: boolean) => void;
  userData: Auth | null;
  expiryWarningVisible: boolean;
};

export default function ProfileSetup(props: Props) {
  const {
    chosenName,
    setChosenName,
    agreementCompleted,
    setAgreementCompleted,
    trainingCertificateCompleted,
    setTrainingCertificateCompleted,
    expiryWarningVisible,
  } = props;

  const hasChosenName = !!chosenName;
  const profileStepsCompleted = hasChosenName && agreementCompleted && trainingCertificateCompleted;
  const [showCertReupload, setShowCertReupload] = useState(false);
  const [isCollapsing, setIsCollapsing] = useState(false);

  const profileSetupSteps: ProfileStep[] = [
    {
      id: "chosen-name",
      title: "Set Your Chosen Name",
      description: "Enter your preferred name - this must match the name on your training certificate",
      completed: hasChosenName,
      current: !hasChosenName,
      expiring: false,
    },
    {
      id: "agreement",
      title: "Approved Researcher Agreement",
      description: "Review and accept the terms to become an approved researcher",
      completed: agreementCompleted,
      current: hasChosenName && !agreementCompleted,
      expiring: false,
    },
    {
      id: "certificate",
      title: "Training Certificate",
      description: "Upload your NHS Digital Data Security Awareness certificate",
      completed: !expiryWarningVisible && trainingCertificateCompleted,
      current: hasChosenName && agreementCompleted,
      expiring: expiryWarningVisible,
    },
  ];

  console.log("expiryWarningVisible", expiryWarningVisible);
  const getCurrentStepComponent = () => {
    if (!hasChosenName) {
      return <ProfileChosenName currentName={chosenName} setChosenName={setChosenName} />;
    }

    if (hasChosenName && !(agreementCompleted && trainingCertificateCompleted)) {
      // if expiring soon show it in orange?

      return (
        <div className={styles["approved-researcher-steps"]}>
          <ApprovedResearcherAgreement
            setAgreementCompleted={setAgreementCompleted}
            agreementCompleted={agreementCompleted}
          />
          <TrainingCertificate
            setTrainingCertificateCompleted={setTrainingCertificateCompleted}
            expiryWarningVisible={expiryWarningVisible}
          />
        </div>
      );
    }

    return null;
  };

  const toggleShowCertReupload = () => {
    // for smooth collapse: TODO: fix
    console.log("showCertReupload", showCertReupload);
    if (showCertReupload) {
      setIsCollapsing(true);
      console.log("isCollapsing", isCollapsing);
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
      <StepProgress
        steps={profileSetupSteps}
        isComplete={profileStepsCompleted}
        completionTitle="Profile Complete!"
        completionSubtitle="You have successfully completed all profile setup steps and are now an approved researcher. You can now create and manage studies."
        completionButtonText="Go to studies"
        completionButtonHref="/studies"
        introText="Complete the following steps to set up your profile and become an approved researcher."
        ariaLabel="Profile setup progress"
        isExpiring={expiryWarningVisible}
      />
      {/* profile complete & show option to upload another cert */}
      {profileStepsCompleted && (
        <div className={`${styles["reupload-option"]} ${isCollapsing ? styles.collapsing : ""}`}>
          <p>
            Your current training certificate is within date, but you may update your certification at any time by
            uploading a new document.
          </p>
          <Button variant="secondary" size="small" onClick={toggleShowCertReupload}>
            {!showCertReupload ? "Upload another certificate" : "Cancel"}
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
            <TrainingCertificate
              setTrainingCertificateCompleted={setTrainingCertificateCompleted}
              expiryWarningVisible={expiryWarningVisible}
            />
          </div>
        </div>
      )}
      {!profileStepsCompleted && <StepArrow />}

      <div className={styles["current-step"]}>{getCurrentStepComponent()}</div>
    </>
  );
}
