import { useCallback, useEffect, useState } from "react";
import {
  getProfile,
  getProfileAgreements,
  getProfileTraining,
  Profile as ProfileData,
  UserAgreements,
  ProfileTraining,
  Auth,
} from "@/openapi";
import { calculateExpiryUrgency } from "@/components/shared/exports";
import { extractErrorMessage } from "@/lib/errorHandler";
import { Alert, AlertMessage } from "@/components/shared/uikitExports";
import ProfileSetupSteps from "./ProfileSetupSteps";
import ProfileSummaryCard from "./ProfileSummaryCard";
import CertificateReupload from "./CertificateReupload";
import Loading from "../ui/Loading";

import styles from "./Profile.module.css";

const computeExpiryUrgency = (completedAt: string): ExpiryUrgency | null => {
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
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [agreementsData, setAgreementsData] = useState<UserAgreements | null>(null);
  const [trainingData, setTrainingData] = useState<ProfileTraining | null>(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [expiryUrgency, setExpiryUrgency] = useState<ExpiryUrgency | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setError] = useState<string | null>(null);

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

      setChosenName(profileResponse.data.chosen_name);
      setProfileData(profileResponse.data);
      setAgreementsData(agreementsResponse.data);
      setTrainingData(trainingResponse.data);
      if (nhsdTraining?.is_valid) setExpiryUrgency(computeExpiryUrgency(nhsdTraining.completed_at!));
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

  const handleStepsComplete = (name: string) => {
    setChosenName(name);
    setProfileComplete(true);
    setExpiryUrgency(null);
    refreshAuth();
  };

  if (isLoading) return <Loading message="Loading your profile..." />;

  if (errorMessage) {
    return (
      <Alert type="error">
        <AlertMessage>{errorMessage}</AlertMessage>
      </Alert>
    );
  }

  if (!profileComplete || expiryUrgency) {
    return (
      <ProfileSetupSteps
        profileData={profileData!}
        agreementsData={agreementsData!}
        trainingData={trainingData!}
        expiryUrgency={expiryUrgency}
        onStepsComplete={handleStepsComplete}
      />
    );
  }

  return (
    <div className={styles["profile-content-container"]}>
      <ProfileSummaryCard chosenName={chosenName} username={userData?.username} roles={userData?.roles} />
      <CertificateReupload trainingData={trainingData} onReupload={fetchProfileData} />
    </div>
  );
}
