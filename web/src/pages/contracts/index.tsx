import { useAuth } from "@/hooks/useAuth";

import MetaHead from "@/components/meta/Head";
import Title from "@/components/ui/Title";
import LoginFallback from "@/components/ui/LoginFallback";
import RequireStudyAccess from "@/components/shared/RequireStudyAccess";
import ContractsSearch from "@/components/contracts/ContractsSearch";

export default function ContractsPage() {
  const { authInProgress, isAuthed } = useAuth();

  if (authInProgress) return null;
  if (!isAuthed) return <LoginFallback />;

  return (
    <>
      <MetaHead title="Contracts | ARC Services Portal" description="Search contracts in the ARC Services Portal" />

      <Title text={"Contracts"} centered description={"Search contracts you have access to across all studies"} />

      <RequireStudyAccess>
        <ContractsSearch />
      </RequireStudyAccess>
    </>
  );
}
