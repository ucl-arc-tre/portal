import { useAuth } from "@/hooks/useAuth";

import MetaHead from "@/components/meta/Head";
import LoginFallback from "@/components/ui/LoginFallback";
import RequireStudyAccess from "@/components/shared/RequireStudyAccess";
import AssetsSearch from "@/components/assets/AssetsSearch";

export default function AssetsPage() {
  const { authInProgress, isAuthed } = useAuth();

  if (authInProgress) return null;
  if (!isAuthed) return <LoginFallback />;

  return (
    <>
      <MetaHead title="Assets | ARC Services Portal" description="Search assets in the ARC Services Portal" />

      <RequireStudyAccess>
        <AssetsSearch />
      </RequireStudyAccess>
    </>
  );
}
