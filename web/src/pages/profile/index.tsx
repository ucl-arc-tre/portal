import { useAuth } from "@/hooks/useAuth";
import MetaHead from "@/components/meta/Head";
import Profile from "@/components/profile/Profile";
import LoginFallback from "@/components/ui/LoginFallback";
import Tokens from "@/components/profile/Tokens";

export default function ProfilePage() {
  const { authInProgress, isAuthed, userData, refreshAuth, isTreOpsStaff, isDshOpsStaff, isAdmin } = useAuth();
  const canSeeDSHTokens = isDshOpsStaff || isAdmin;
  const canSeeTRETokens = isTreOpsStaff || isAdmin;

  if (authInProgress) return null;

  if (!isAuthed) return <LoginFallback />;

  return (
    <>
      <MetaHead
        title="User Profile | ARC Services Portal"
        description="View and manage your ARC profile and researcher status"
      />

      <div className="content">
        <Profile userData={userData} refreshAuth={refreshAuth} />

        {canSeeDSHTokens && <Tokens environment="dsh" />}
        {canSeeTRETokens && <Tokens environment="tre" />}
      </div>
    </>
  );
}
