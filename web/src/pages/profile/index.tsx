import { useAuth } from "@/hooks/useAuth";
import MetaHead from "@/components/meta/Head";
import Profile from "@/components/profile/Profile";
import LoginFallback from "@/components/ui/LoginFallback";
import Title from "@/components/ui/Title";
import DSHTokens from "@/components/profile/DSHTokens";

export default function ProfilePage() {
  const { authInProgress, isAuthed, userData, refreshAuth } = useAuth();
  const canSeeDSHTokens = userData?.roles.includes("dsh-ops-staff") || userData?.roles.includes("admin");

  if (authInProgress) return null;

  if (!isAuthed) return <LoginFallback />;

  return (
    <>
      <MetaHead
        title="User Profile | ARC Services Portal"
        description="View and manage your ARC profile and researcher status"
      />

      <div className="content">
        <Title text={"Profile"} centered />

        <Profile userData={userData} refreshAuth={refreshAuth} />

        {canSeeDSHTokens && <DSHTokens />}
      </div>
    </>
  );
}
