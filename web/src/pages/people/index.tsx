import MetaHead from "@/components/meta/Head";
import ApprovedResearcherImport from "@/components/people/ApprovedResearcherImport";
import ExternalInvite from "@/components/people/ExternalInvite";
import LoginFallback from "@/components/ui/LoginFallback";
import Title from "@/components/ui/Title";
import { useAuth } from "@/hooks/useAuth";
import styles from "./PeoplePage.module.css";
import { Alert, AlertMessage } from "@/components/shared/uikitExports";
import PeopleSearch from "@/components/people/Search";

export default function PeoplePage() {
  const { authInProgress, isAuthed, userData, isIGStaff } = useAuth();

  if (authInProgress) return null;

  if (!isAuthed) return <LoginFallback />;

  const isAdmin = userData?.roles.includes("admin");
  const isIAO = userData?.roles.includes("information-asset-owner");
  const isTreOpsStaff = userData?.roles.includes("tre-ops-staff");
  const isDSHOpsStaff = userData?.roles.includes("dsh-ops-staff");
  const canSearch = isTreOpsStaff || isAdmin || isIGStaff || isDSHOpsStaff;

  if (!isIAO && !canSearch) {
    return (
      <Alert type="warning">
        <AlertMessage>You do not have permission to view this page</AlertMessage>
      </Alert>
    );
  }

  return (
    <div className="content">
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
            : isTreOpsStaff || isDSHOpsStaff || isIGStaff
              ? "View approved researchers"
              : isIAO
                ? "View users in your projects or invite a collaborator"
                : "You do not have permission to view this page"
        }
      />
      {(isAdmin || isIAO || isIGStaff) && (
        <div className={styles["button-container"]}>
          {isAdmin && <ApprovedResearcherImport />}
          <ExternalInvite />
        </div>
      )}

      {canSearch && <PeopleSearch />}
    </div>
  );
}
