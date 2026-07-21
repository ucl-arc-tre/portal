import { useCallback, useEffect, useState } from "react";
import {
  getProfile,
  getProfileAgreements,
  getProfileTraining,
  Profile as ProfileData,
  UserAgreements,
  ProfileTraining,
  Auth,
  postNotificationsRead,
} from "@/openapi";
import { calculateExpiryUrgency } from "@/components/shared/exports";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";
import Error from "../ui/Error";
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
  const [profileData, setProfileData] = useState<ProfileData | undefined>(undefined);
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

      if (responseIsError(profileResponse) || !profileResponse.data) {
        const errorMsg = extractErrorMessage(profileResponse);
        setError(`Failed to load Information Assets: ${errorMsg}`);
        return;
      }

      if (responseIsError(agreementsResponse) || !agreementsResponse.data) {
        const errorMsg = extractErrorMessage(agreementsResponse);
        setError(`Failed to load Information Assets: ${errorMsg}`);
        return;
      }

      if (responseIsError(trainingResponse) || !trainingResponse.data) {
        const errorMsg = extractErrorMessage(trainingResponse);
        setError(`Failed to load Information Assets: ${errorMsg}`);
        return;
      }

      const nhsdTraining = trainingResponse.data.training_records.find(
        (record) => record.kind === "training_kind_nhsd" || record.is_ig_kind
      );
      const trainingExpiryUrgency = nhsdTraining?.completed_at ? computeExpiryUrgency(nhsdTraining.completed_at) : null;
      setExpiryUrgency(trainingExpiryUrgency);

      setProfileData(profileResponse.data);
      setAgreementsData(agreementsResponse.data);
      setTrainingData(trainingResponse.data);
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

  const clearCompleteProfileCompleteNotification = async () => {
    const response = await postNotificationsRead({ body: { kind: "complete-profile" } });
    if (responseIsError(response)) {
      console.log(`Failed to clear complete profile notfiication ${extractErrorMessage(response)}`);
    }
  };

  const handleStepsComplete = () => {
    setProfileComplete(true);
    setExpiryUrgency(null);
    refreshAuth();
    fetchProfileData();
    clearCompleteProfileCompleteNotification();
  };

  if (isLoading) return <Loading message="Loading your profile" />;

  if (errorMessage) {
    return <Error message={errorMessage} />;
  }

  if (!profileComplete) {
    return (
      <ProfileSetupSteps
        profileData={profileData!}
        agreementsData={agreementsData!}
        trainingData={trainingData!}
        onStepsComplete={handleStepsComplete}
      />
    );
  }

  return (
    <div className={styles["profile-content-container"]}>
      <ProfileSummaryCard
        profileData={profileData}
        username={userData?.username}
        roles={userData?.roles}
        callback={() => fetchProfileData()}
      />
      <CertificateReupload trainingData={trainingData} expiryUrgency={expiryUrgency} onReupload={fetchProfileData} />
    </div>
  );
}
