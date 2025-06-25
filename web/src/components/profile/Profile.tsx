import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getProfile, getProfileAgreements } from "@/openapi";
import LoginFallback from "@/components/ui/LoginFallback";
import Title from "@/components/ui/Title";
import ProfileStepProgress from "./ProfileStepProgress";
import ProfileChosenName from "./ProfileChosenName";
import ApprovedResearcherAgreement from "./approved-researcher/ApprovedResearcherAgreement";
import TrainingCertificate from "./approved-researcher/TrainingCertificate";

import styles from "./Profile.module.css";

export default function Profile() {
  const { authInProgress, isAuthed, userData } = useAuth();
  const [chosenName, setChosenName] = useState<string | undefined>(undefined);
  const [agreementCompleted, setAgreementCompleted] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [profileResponse, agreementsResponse] = await Promise.all([getProfile(), getProfileAgreements()]);

        if (profileResponse.response.ok && profileResponse.data?.chosen_name) {
          setChosenName(profileResponse.data.chosen_name);
        } else {
          setChosenName("");
        }

        if (agreementsResponse.response.ok && agreementsResponse.data) {
          const confirmedAgreements = agreementsResponse.data.confirmed_agreements;
          setAgreementCompleted(
            confirmedAgreements.some((agreement) => agreement.agreement_type === "approved-researcher")
          );
        }
      } catch (error) {
        console.error("Failed to get profile data:", error);
        setChosenName("");
      }
    };

    if (isAuthed) {
      fetchProfileData();
    }
  }, [isAuthed]);

  if (authInProgress || chosenName === undefined) return null;

  if (!isAuthed) return <LoginFallback />;

  const isApprovedResearcher = userData?.roles?.includes("approved-researcher");
  const hasChosenName = !!chosenName;

  const steps: ProfileStep[] = [
    {
      id: "chosen-name",
      title: "Set Your Chosen Name",
      description: "Enter your preferred name for forms and documents",
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
      completed: isApprovedResearcher || false,
      current: hasChosenName && agreementCompleted && !isApprovedResearcher,
    },
  ];

  const getCurrentStepComponent = () => {
    if (!hasChosenName) {
      return <ProfileChosenName currentName={chosenName} setChosenName={setChosenName} />;
    }

    if (hasChosenName && !isApprovedResearcher) {
      return (
        <div className={styles["approved-researcher-steps"]}>
          <ApprovedResearcherAgreement
            setAgreementCompleted={setAgreementCompleted}
            agreementCompleted={agreementCompleted}
          />
          <hr className={styles.divider} />
          <TrainingCertificate />
        </div>
      );
    }

    return (
      <div className={styles["completed-message"]}>
        <h2>Profile Complete!</h2>
        <p>You have successfully completed all profile setup steps and are now an approved researcher.</p>
      </div>
    );
  };

  return (
    <>
      <Title text={"Profile Setup"} />

      <div className={styles["welcome-section"]}>
        <h2>Welcome, {userData?.username}!</h2>
        <p>Complete the following steps to set up your profile and become an approved researcher.</p>
      </div>

      <ProfileStepProgress steps={steps} />

      <div className={styles["current-step"]}>{getCurrentStepComponent()}</div>
    </>
  );
}
