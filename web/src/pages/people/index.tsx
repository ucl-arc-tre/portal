import MetaHead from "@/components/meta/Head";
import ApprovedResearcherImport from "@/components/people/ApprovedResearcherImport";
import ExternalInvite from "@/components/people/ExternalInvite";
import LoginFallback from "@/components/ui/LoginFallback";
import Title from "@/components/ui/Title";
import { useAuth } from "@/hooks/useAuth";
import styles from "./PeoplePage.module.css";
import { useState } from "react";
import { getUsers, UserData } from "@/openapi";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";
import Box from "@/components/ui/Box";
import { Alert, AlertMessage, HelperText } from "@/components/shared/uikitExports";
import UserDataTable from "@/components/people/UserDataTable";
import Callout from "@/components/ui/Callout";
import dynamic from "next/dynamic";
import Search from "@/components/ui/Search";

export const SearchIcon = dynamic(() => import("uikit-react-public").then((mod) => mod.Icon.Search), {
  ssr: false,
});

export default function PeoplePage() {
  const { authInProgress, isAuthed, userData } = useAuth();
  const [users, setUsers] = useState<Array<UserData> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchErrorMessage, setSearchErrorMessage] = useState("");

  if (authInProgress) return null;

  if (!isAuthed) return <LoginFallback />;

  const isAdmin = userData?.roles.includes("admin");
  const isIGOps = userData?.roles.includes("ig-ops-staff");
  const isIAO = userData?.roles.includes("information-asset-owner");
  const isTreOpsStaff = userData?.roles.includes("tre-ops-staff");
  const isDSHOpsStaff = userData?.roles.includes("dsh-ops-staff");
  const canSearch = isTreOpsStaff || isAdmin || isIGOps || isDSHOpsStaff;

  const handleUserSearch = async (query: string) => {
    setIsLoading(true);
    if (query === "") {
      setSearchErrorMessage("");
      setSearchTerm("");
      return;
    }
    const regex = /^\w[a-zA-Z0-9\-\.+@_\s]+\w$/;
    const isValid = new RegExp(regex).test(query);

    if (!isValid) {
      if (query.length < 3) {
        setSearchErrorMessage("Not enough characters; there's a minimum of 3 characters required to perform search");
      } else {
        setSearchErrorMessage("Invalid query, only alphanumeric characters, @ and - are allowed");
      }
      return;
    }

    try {
      const response = await getUsers({ query: { find: query } });

      if (responseIsError(response) || !response.data) {
        const errorMsg = extractErrorMessage(response);
        setErrorMessage(`Failed to search users: ${errorMsg}`);
        return;
      }

      setSearchTerm(query);
      setUsers(response.data);
      setSearchErrorMessage("");
      setErrorMessage("");
    } catch (err) {
      console.error("Failed to search users:", err);
      setErrorMessage("Failed to search users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isIAO && !canSearch) {
    return (
      <Alert type="warning">
        <AlertMessage>You do not have permission to view this page</AlertMessage>
      </Alert>
    );
  }

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
            : isTreOpsStaff || isDSHOpsStaff
              ? "View approved researchers"
              : isIAO
                ? "View users in your projects or invite a collaborator"
                : "You do not have permission to view this page"
        }
      />
      {(isAdmin || isIAO) && (
        <div className={styles["button-container"]}>
          {isAdmin && <ApprovedResearcherImport />}
          <ExternalInvite />
        </div>
      )}

      {canSearch && (
        <div className={styles["search-wrapper"]}>
          <Search placeholder="Search users..." onSearch={handleUserSearch} id="user-search" />
          <HelperText>
            <small>Search by email address or user principal</small>
          </HelperText>
        </div>
      )}

      {searchErrorMessage !== "" && (
        <Alert type="error">
          <AlertMessage>{searchErrorMessage}</AlertMessage>
        </Alert>
      )}

      {errorMessage && (
        <Alert type="error">
          <AlertMessage>{errorMessage}</AlertMessage>
        </Alert>
      )}

      <Callout construction />

      {canSearch &&
        searchTerm.length > 0 &&
        !searchErrorMessage &&
        (!users || users.length === 0 ? (
          <Box>
            <div className={styles["no-users-found"]}>
              {searchTerm.length > 2
                ? `No users found for "${searchTerm}". Try another query`
                : "No users found, try another query"}
            </div>
          </Box>
        ) : (
          <>
            <h3 className={styles["results-heading"]}>Results for &ldquo;{searchTerm}&rdquo;</h3>
            <UserDataTable canEdit={isAdmin!} users={users} setUsers={setUsers} isLoading={isLoading} />
          </>
        ))}
    </>
  );
}
