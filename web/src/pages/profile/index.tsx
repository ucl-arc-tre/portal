import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getProfile, getProfileAgreements, getProfileTraining } from "@/openapi";
import MetaHead from "@/components/meta/Head";
import ProfileSetup from "@/components/profile/ProfileSetup";
import LoginFallback from "@/components/ui/LoginFallback";
import Title from "@/components/ui/Title";
import Loading from "@/components/ui/Loading";
import ProfileSummaryCard from "@/components/profile/ProfileSummaryCard";

export default function ProfilePage() {
  const { authInProgress, isAuthed, userData } = useAuth();
  const [chosenName, setChosenName] = useState<string | undefined>(undefined);
  const [agreementCompleted, setAgreementCompleted] = useState(false);
  const [trainingCertificateCompleted, setTrainingCertificateCompleted] = useState(false);
  const [expiryUrgency, setExpiryUrgency] = useState<ExpiryUrgency | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);

      try {
        const [profileResponse, agreementsResponse, trainingResponse] = await Promise.all([
          getProfile(),
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
          if (nhsdTraining?.is_valid) {
            const completedDate = new Date(nhsdTraining.completed_at!);
            const today = new Date();

            const diffTime = today.getTime() - completedDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // low: 2 months remaining; medium: 1 month remaining; high: less than 1 month
            if (diffDays > 10 * 30) {
              setExpiryUrgency({ level: "low" });
            } else if (diffDays > 11 * 30) {
              setExpiryUrgency({ level: "medium" });
            } else if (diffDays > 11.5 * 30) {
              setExpiryUrgency({ level: "high" });
            }
          }
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

  return (
    <>
      <MetaHead
        title="User Profile | ARC Services Portal"
        description="View and manage your ARC profile and researcher status"
      />

      <Title text={"Profile Setup"} />

      <ProfileSummaryCard chosenName={chosenName} username={userData?.username} roles={userData?.roles} />

      <ProfileSetup
        chosenName={chosenName}
        setChosenName={setChosenName}
        agreementCompleted={agreementCompleted}
        setAgreementCompleted={setAgreementCompleted}
        trainingCertificateCompleted={trainingCertificateCompleted}
        setTrainingCertificateCompleted={setTrainingCertificateCompleted}
        userData={userData}
        expiryUrgency={expiryUrgency}
      />
    </>
  );
}
