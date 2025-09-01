import MetaHead from "@/components/meta/Head";
import ApprovedResearcherImport from "@/components/people/ApprovedResearcherImport";
import ExternalInvite from "@/components/people/ExternalInvite";
import LoginFallback from "@/components/ui/LoginFallback";
import Title from "@/components/ui/Title";
import { useAuth } from "@/hooks/useAuth";
import styles from "./PeoplePage.module.css";
import { useEffect, useState } from "react";
import { getUsers, UserData } from "@/openapi";
import Box from "@/components/ui/Box";
import { Alert, AlertMessage, Input } from "@/components/shared/exports";
import UserDataTable from "@/components/people/UserDataTable";
import Callout from "@/components/ui/Callout";
import dynamic from "next/dynamic";

export const SearchIcon = dynamic(() => import("uikit-react-public").then((mod) => mod.Icon.Search), {
  ssr: false,
});

export default function PeoplePage() {
  const { authInProgress, isAuthed, userData } = useAuth();
  const [users, setUsers] = useState<Array<UserData> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchPeople = async () => {
      setIsLoading(true);
      try {
        const response = await getUsers();
        if (response.response.ok && response.data) {
          setUsers(response.data);
        }
      } catch (error) {
        console.error("Failed to get people:", error);
        setErrorMessage("Failed to get people");
        setUsers(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPeople();
  }, []);

  if (authInProgress) return null;

  if (!isAuthed) return <LoginFallback />;

  const isAdmin = userData?.roles.includes("admin");
  const isIAO = userData?.roles.includes("information-asset-owner");
  const isTreOpsStaff = userData?.roles.includes("tre-ops-staff");

  if (!isAdmin && !isTreOpsStaff && !isIAO)
    return (
      <Alert type="warning">
        <AlertMessage>You do not have permission to view this page</AlertMessage>
      </Alert>
    );

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
            : isTreOpsStaff
              ? "View approved researchers"
              : isIAO
                ? "View users in your projects or invite a collaborator"
                : "You do not have permission to view this page"
        }
      />

      <div className={styles["button-container"]}>
        {(isAdmin || isTreOpsStaff) && (
          <Input placeholder="search users..." icon={<SearchIcon />} iconPosition="left" disabled />
        )}
        {isAdmin && <ApprovedResearcherImport />}
        {(isAdmin || isIAO) && <ExternalInvite />}
      </div>
      {!isAdmin && <Callout construction />}
      {!users || users.length === 0 ? (
        <Box>
          <div className={styles["no-users-found"]}>No users found</div>
          {errorMessage && (
            <Alert type="error">
              <AlertMessage>{errorMessage}</AlertMessage>
            </Alert>
          )}
        </Box>
      ) : (
        <UserDataTable canEdit={true} users={users} setUsers={setUsers} isLoading={isLoading} />
      )}
    </>
  );
}
