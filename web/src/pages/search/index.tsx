import MetaHead from "@/components/meta/Head";
import LoginFallback from "@/components/ui/LoginFallback";
import Title from "@/components/ui/Title";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertMessage } from "@/components/ui/uikitExports";

export default function SearchPage() {
  const { authInProgress, isAuthed, isIGStaff, isAdmin } = useAuth();

  if (authInProgress) return null;

  if (!isAuthed) return <LoginFallback />;

  const canSeeSearch = isIGStaff || isAdmin;

  if (!canSeeSearch)
    return (
      <Alert type="warning">
        <AlertMessage>You do not have permission to view this page</AlertMessage>
      </Alert>
    );

  return (
    <>
      <MetaHead
        title="Search | ARC Services Portal"
        description="Search studies, assets, contracts, projects and people in the ARC Services Portal"
      />
      <Title
        text={"Search"}
        centered
        description={"Search studies, assets, contracts, projects and people in the ARC Services Portal"}
      />
    </>
  );
}
