import MetaHead from "@/components/meta/Head";
import AdminView from "@/components/people/AdminView";
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
      {cannotView && <div>You do not have permission to view this page</div>}
      {isAdmin ? <AdminView /> : isApprovedResearcher && <p>Approved Researcher</p>}
    </>
  );
}
