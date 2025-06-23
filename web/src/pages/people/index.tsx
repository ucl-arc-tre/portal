import MetaHead from "@/components/meta/Head";
import LoginFallback from "@/components/ui/LoginFallback";
import { useAuth } from "@/hooks/useAuth";

export default function PeoplePage() {
  const { authInProgress, isAuthed, userData } = useAuth();
  if (authInProgress) return null;

  if (!isAuthed) return <LoginFallback />;

  const isAdmin = userData?.roles.includes("admin");
  const isApprovedResearcher = userData?.roles.includes("approved-researcher");

  const cannotView = !isAdmin && !isApprovedResearcher;

  return (
    <>
      <MetaHead
        title="People | ARC Services Portal"
        description="View and modify people you're permitted to manage in the ARC Services Portal"
      />
      <h1>People</h1>
      {cannotView && <h4>You do not have permission to view this page</h4>}
    </>
  );
}
