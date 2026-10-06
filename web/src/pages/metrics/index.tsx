import MetaHead from "@/components/meta/Head";
import LoginFallback from "@/components/ui/LoginFallback";
import PageHeader from "@/components/ui/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertMessage, HelperText } from "@/components/ui/uikitExports";
import Metrics from "@/components/metrics/Metrics";
import styles from "./MetricsPage.module.css";

export default function MetricsPage() {
  const { authInProgress, isAuthed, isIGStaff, isAdmin } = useAuth();

  if (authInProgress) return null;

  if (!isAuthed) return <LoginFallback />;

  const canSeeMetrics = isIGStaff || isAdmin;

  if (!canSeeMetrics)
    return (
      <Alert type="warning">
        <AlertMessage>You do not have permission to view this page</AlertMessage>
      </Alert>
    );

  return (
    <div className={styles.container}>
      <MetaHead
        title="Metrics | ARC Services Portal"
        description="View metrics for users/studies/people in the ARC Services Portal"
      />
      <PageHeader title="Metrics" />
      <HelperText>View metrics for users, studies and people in the ARC Services Portal</HelperText>

      <Metrics />
    </div>
  );
}
