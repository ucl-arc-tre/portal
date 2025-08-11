import MetaHead from "@/components/meta/Head";
import AdminView from "@/components/people/AdminView";
import LoginFallback from "@/components/ui/LoginFallback";
import Title from "@/components/ui/Title";
import { useAuth } from "@/hooks/useAuth";
import ApprovedResearcherView from "@/components/people/ApprovedResearcherView";

export default function PeoplePage() {
  const { authInProgress, isAuthed, userData } = useAuth();
  if (authInProgress) return null;

  if (!isAuthed) return <LoginFallback />;

  const isAdmin = userData?.roles.includes("admin");
  const isApprovedResearcher = userData?.roles.includes("approved-researcher");
  const isStaff = userData!.is_staff;

  const cannotView = !isAdmin && !isApprovedResearcher;

  return (
    <>
      <MetaHead
        title="People | ARC Services Portal"
        description="View and modify people you're permitted to manage in the ARC Services Portal"
      />
      <Title text={"People"} />
      {cannotView && <h4>You do not have permission to view this page</h4>}
      {isAdmin ? <AdminView /> : isApprovedResearcher && <ApprovedResearcherView isStaff={isStaff} />}
    </>
  );
}
