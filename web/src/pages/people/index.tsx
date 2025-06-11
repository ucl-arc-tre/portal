import MetaHead from "@/components/meta/Head";
import AdminView from "@/components/people/AdminView";
import LoginFallback from "@/components/ui/LoginFallback";
import { useAuth } from "@/hooks/useAuth";

export default function PeoplePage() {
  const { loading, isAuthed, userData } = useAuth();
  if (loading) return null;

  if (!isAuthed) return <LoginFallback />;

  const cannotView = !userData?.roles.includes("admin") && !userData?.roles.includes("approved-researcher");

  return (
    <>
      <MetaHead
        title="People | ARC Services Portal"
        description="View and modify people you're permitted to manage in the ARC Services Portal"
      />
      <h1>People</h1>
      {cannotView && <h4>You do not have permission to view this page</h4>}
      {userData?.roles.includes("admin") ? (
        <AdminView />
      ) : (
        userData?.roles.includes("approved-researcher") && <p>Approved Researcher</p>
      )}
    </>
  );
}
