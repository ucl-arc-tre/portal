import { useCallback, useEffect, useState } from "react";
import { getProfile, getProfileAgreements, getProfileTraining, Auth } from "@/openapi";
import { calculateExpiryUrgency } from "@/components/shared/exports";
import { extractErrorMessage } from "@/lib/errorHandler";
import { Alert, AlertMessage } from "@/components/shared/uikitExports";
import ProfileSetupSteps from "./ProfileSetupSteps";
import ProfileSummaryCard from "./ProfileSummaryCard";
import TrainingCertificate from "./approved-researcher-components/TrainingCertificate";
import Loading from "../ui/Loading";
import Button from "../ui/Button";

import styles from "./Profile.module.css";

const computeExpiryUrgency = (completedAt: string): ExpiryUrgency => {
  const expiryDate = new Date(completedAt);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  return calculateExpiryUrgency(expiryDate);
};

type Props = {
  userData: Auth | null;
  refreshAuth: () => Promise<void>;
};

export default function Profile({ userData, refreshAuth }: Props) {
  const [chosenName, setChosenName] = useState<string>("");
  const [agreementCompleted, setAgreementCompleted] = useState(false);
  const [trainingCompleted, setTrainingCompleted] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [expiryUrgency, setExpiryUrgency] = useState<ExpiryUrgency | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setError] = useState<string | null>(null);
  const [showCertReupload, setShowCertReupload] = useState(false);
  const [isCollapsing, setIsCollapsing] = useState(false);

  const fetchProfileData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [profileResponse, agreementsResponse, trainingResponse] = await Promise.all([
        getProfile(),
        getProfileAgreements(),
        getProfileTraining(),
      ]);

      if (!profileResponse.response.ok || !profileResponse.data) {
        const errorMsg = extractErrorMessage(profileResponse);
        setError(`Failed to load Information Assets: ${errorMsg}`);
        return;
      }

      if (!agreementsResponse.response.ok || !agreementsResponse.data) {
        const errorMsg = extractErrorMessage(agreementsResponse);
        setError(`Failed to load Information Assets: ${errorMsg}`);
        return;
      }

      if (!trainingResponse.response.ok || !trainingResponse.data) {
        const errorMsg = extractErrorMessage(trainingResponse);
        setError(`Failed to load Information Assets: ${errorMsg}`);
        return;
      }

      const nhsdTraining = trainingResponse.data.training_records.find(
        (record) => record.kind === "training_kind_nhsd"
      );
      const trainingValid = nhsdTraining?.is_valid || false;

      setChosenName(profileResponse.data.chosen_name);
      setAgreementCompleted(
        agreementsResponse.data.confirmed_agreements.some(
          (agreement) => agreement.agreement_type === "approved-researcher"
        )
      );
      setTrainingCompleted(trainingValid);
      if (trainingValid) setExpiryUrgency(computeExpiryUrgency(nhsdTraining!.completed_at!));
    } catch (error) {
      console.error("Failed to get profile data:", error);
      setError("Failed to load profile data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  if (isLoading) return <Loading message="Loading your profile..." />;

  if (errorMessage) {
    return (
      <Alert type="error">
        <AlertMessage>{errorMessage}</AlertMessage>
      </Alert>
    );
  }

  const handleStepsComplete = (name: string) => {
    setChosenName(name);
    setProfileComplete(true);
    setExpiryUrgency(null);
    refreshAuth();
  };

  if (!profileComplete || expiryUrgency) {
    return (
      <ProfileSetupSteps
        initialChosenName={chosenName}
        initialAgreementCompleted={agreementCompleted}
        initialTrainingCompleted={trainingCompleted}
        expiryUrgency={expiryUrgency}
        onStepsComplete={handleStepsComplete}
      />
    );
  }

  const toggleShowCertReupload = () => {
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
      <ProfileSummaryCard chosenName={chosenName} username={userData?.username} roles={userData?.roles} />

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
            isCollapsing ? styles["cert-collapsing"] : showCertReupload ? styles["cert-visible"] : styles["cert-hidden"]
          }`}
        >
          <TrainingCertificate setTrainingCertificateCompleted={() => fetchProfileData()} />
        </div>
      </div>
    </>
  );
}
