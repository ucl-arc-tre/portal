import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getUserIdentity, getProfileAgreements, getProfileTraining } from "@/openapi";
import LoginFallback from "@/components/ui/LoginFallback";
import Title from "@/components/ui/Title";
import Loading from "@/components/ui/Loading";
import ProfileStepProgress from "./ProfileStepProgress";
import ProfileSummaryCard from "./ProfileSummaryCard";
import ProfileChosenName from "./ProfileChosenName";
import ApprovedResearcherAgreement from "./approved-researcher/ApprovedResearcherAgreement";
import TrainingCertificate from "./approved-researcher/TrainingCertificate";

import styles from "./Profile.module.css";

export default function Profile() {
  const { authInProgress, isAuthed, userData } = useAuth();
  const [chosenName, setChosenName] = useState<string | undefined>(undefined);
  const [agreementCompleted, setAgreementCompleted] = useState(false);
  const [trainingCertificateCompleted, setTrainingCertificateCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        const [profileResponse, agreementsResponse, trainingResponse] = await Promise.all([
          getUserIdentity(),
          getProfileAgreements(),
          getProfileTraining(),
        ]);

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

        if (trainingResponse.response.ok && trainingResponse.data) {
          const nhsdTraining = trainingResponse.data.training_records.find(
            (record) => record.kind === "training_kind_nhsd"
          );
          setTrainingCertificateCompleted(nhsdTraining?.is_valid || false);
        }
      } catch (error) {
        console.error("Failed to get profile data:", error);
        setChosenName("");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthed) {
      fetchProfileData();
    }
  }, [isAuthed]);

  if (authInProgress) return null;

  if (!isAuthed && !authInProgress) return <LoginFallback />;

  if (isLoading) {
    return (
      <>
        <Title text={"Profile Setup"} />
        <Loading message="Loading your profile..." />
      </>
    );
  }

  const hasChosenName = !!chosenName;

  const steps: ProfileStep[] = [
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
          <hr className={styles.divider} />
          <TrainingCertificate setTrainingCertificateCompleted={setTrainingCertificateCompleted} />
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <Title text={"Profile Setup"} />

      <ProfileSummaryCard chosenName={chosenName} username={userData?.username} roles={userData?.roles} />

      <ProfileStepProgress
        steps={steps}
        profileIsComplete={hasChosenName && agreementCompleted && trainingCertificateCompleted}
      />

      <div className={styles["current-step"]}>{getCurrentStepComponent()}</div>
    </>
  );
}
