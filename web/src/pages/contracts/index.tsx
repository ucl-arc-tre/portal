import { useAuth } from "@/hooks/useAuth";

import MetaHead from "@/components/meta/Head";
import LoginFallback from "@/components/ui/LoginFallback";
import ContractsSearch from "@/components/contracts/ContractsSearch";
import RequireStudyAccess from "@/components/shared/RequireStudyAccess";

export default function ContractsPage() {
  const { authInProgress, isAuthed } = useAuth();

  if (authInProgress) return null;
  if (!isAuthed) return <LoginFallback />;

  return (
    <>
      <MetaHead title="Contracts | ARC Services Portal" description="Search contracts in the ARC Services Portal" />

      <RequireStudyAccess>
        <ContractsSearch />
      </RequireStudyAccess>
    </>
  );
}
