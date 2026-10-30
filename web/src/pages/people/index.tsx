import MetaHead from "@/components/meta/Head";
import ApprovedResearcherImport from "@/components/people/ApprovedResearcherImport";
import ExternalInvite from "@/components/people/ExternalInvite";
import LoginFallback from "@/components/ui/LoginFallback";
import PageHeader from "@/components/ui/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import styles from "./PeoplePage.module.css";
import { Alert, AlertMessage, HelperText } from "@/components/ui/uikitExports";
import PeopleSearch from "@/components/people/Search";
import Callout from "@/components/ui/Callout";

export default function PeoplePage() {
  const {
    authInProgress,
    isAuthed,
    isIGStaff,
    isAdmin,
    isTreOpsStaff,
    isIAO,
    isDshOpsStaff: isDSHOpsStaff,
  } = useAuth();

  if (authInProgress) return null;

  if (!isAuthed) return <LoginFallback />;

  const canSearch = isTreOpsStaff || isAdmin || isIGStaff || isDSHOpsStaff;

  if (!isIAO && !canSearch) {
    return (
      <Alert type="warning">
        <AlertMessage>You do not have permission to view this page</AlertMessage>
      </Alert>
    );
  }

  return (
    <div className={styles.container}>
      <MetaHead
        title="People | ARC Services Portal"
        description="View and modify people you're permitted to manage in the ARC Services Portal"
      />

      <PageHeader title="People">{(isAdmin || isIAO || isIGStaff) && <ExternalInvite />}</PageHeader>

      <HelperText>
        {isAdmin
          ? "View and manage portal users, including adding via invitation or upload"
          : canSearch && "View approved researchers"}
      </HelperText>

      {!canSearch && (
        <Callout
          construction
          text={
            "This page is still being built. You'll be able to see people across all the studies and projects you own."
          }
        />
      )}

      {isAdmin && (
        <div className={styles["import-actions"]}>
          <ApprovedResearcherImport />
        </div>
      )}

      {canSearch && <PeopleSearch />}
    </div>
  );
}
