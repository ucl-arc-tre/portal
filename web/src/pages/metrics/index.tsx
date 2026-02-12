import MetaHead from "@/components/meta/Head";
import LoginFallback from "@/components/ui/LoginFallback";
import Title from "@/components/ui/Title";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertMessage } from "@/components/shared/exports";
import Metrics from "@/components/metrics/Metrics";

export default function PeoplePage() {
  const { authInProgress, isAuthed, userData } = useAuth();

  if (authInProgress) return null;

  if (!isAuthed) return <LoginFallback />;

  const isAdmin = userData?.roles.includes("admin");
  const isIGOps = userData?.roles.includes("ig-ops-staff");
  const canSeeMetrics = isIGOps || isAdmin;

  if (!canSeeMetrics)
    return (
      <Alert type="warning">
        <AlertMessage>You do not have permission to view this page</AlertMessage>
      </Alert>
    );

  return (
    <>
      <MetaHead
        title="Metrics | ARC Services Portal"
        description="View metrics for users/studies/people in the ARC Services Portal"
      />
      <Title
        text={"Metrics"}
        centered
        description={"View metrics for users, studies and people in the ARC Services Portal"}
      />

      <Metrics />
    </>
  );
}
