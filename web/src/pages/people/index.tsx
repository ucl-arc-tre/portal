import MetaHead from "@/components/meta/Head";
import AdminView from "@/components/people/AdminView";
import ApprovedResearcherView from "@/components/people/ApprovedResearcherView";
import LoginFallback from "@/components/ui/LoginFallback";
import Title from "@/components/ui/Title";
import { useAuth } from "@/hooks/useAuth";

export default function PeoplePage() {
  const { authInProgress, isAuthed, userData } = useAuth();
  if (authInProgress) return null;

  if (!isAuthed) return <LoginFallback />;

  const isAdmin = userData?.roles.includes("admin");
  const isIAO = userData?.roles.includes("information-asset-owner") || false;

  return (
    <>
      <MetaHead
        title="People | ARC Services Portal"
        description="View and modify people you're permitted to manage in the ARC Services Portal"
      />
      <Title
        text={"People"}
        centered
        description={
          isAdmin
            ? "View and manage portal users, including adding via invitation or upload"
            : isIAO
              ? "View users in your projects or invite a collaborator"
              : "You do not have permission to view this page"
        }
      />
      {isAdmin ? <AdminView /> : isIAO && <ApprovedResearcherView isIAO={isIAO} />}
    </>
  );
}
