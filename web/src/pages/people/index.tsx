import MetaHead from "@/components/meta/Head";
import ApprovedResearcherImport from "@/components/people/ApprovedResearcherImport";
import ExternalInvite from "@/components/people/ExternalInvite";
import LoginFallback from "@/components/ui/LoginFallback";
import Title from "@/components/ui/Title";
import { useAuth } from "@/hooks/useAuth";
import styles from "./PeoplePage.module.css";
import { useRef, useState } from "react";
import { getUsers, UserData } from "@/openapi";
import Box from "@/components/ui/Box";
import { Alert, AlertMessage, HelperText, Input } from "@/components/shared/exports";
import UserDataTable from "@/components/people/UserDataTable";
import Callout from "@/components/ui/Callout";
import dynamic from "next/dynamic";
import Button from "@/components/ui/Button";

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
  const searchRef = useRef<HTMLInputElement>(null);

  if (authInProgress) return null;

  if (!isAuthed) return <LoginFallback />;

  const isAdmin = userData?.roles.includes("admin");
  const isIAO = userData?.roles.includes("information-asset-owner");
  const isTreOpsStaff = userData?.roles.includes("tre-ops-staff");
  const canSearch = isTreOpsStaff || isAdmin;

  const handleUserSearch = async (query: string) => {
    setIsLoading(true);
    if (query === "") {
      setSearchErrorMessage("");
      setSearchTerm("");
      return;
    }

    const regex = /^\w[\w.\s0-9@-]+\w$/;
    const isValid = new RegExp(regex).test(query);

    if (!isValid) {
      if (query.length < 3) {
        setSearchErrorMessage("Not enough characters; there's a minimum of 3 characters required to perform search");
      } else {
        setSearchErrorMessage("Invalid query, only alphanumeric characters, @ and - are allowed");
      }
      return;
    }

    const response = await getUsers({ query: { find: query } });

    if (!response.response.ok || !response.data) {
      setErrorMessage("Oops, something went wrong when trying to complete your search. Refresh and try again");
      setIsLoading(false);
      return;
    }
    setSearchTerm(query);
    setUsers(response.data);
    setSearchErrorMessage("");
    setIsLoading(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    searchRef.current!.value = inputValue;
  };

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
        {isAdmin && <ApprovedResearcherImport />}
        {(isAdmin || isIAO) && <ExternalInvite />}
      </div>
      {canSearch && (
        <div className={styles["search-wrapper"]}>
          <form className={styles["search-container"]} data-cy="search-users">
            <Input
              placeholder="search users..."
              id={styles.search}
              name="search"
              onChange={handleInputChange}
              ref={searchRef}
              aria-label="search users of the portal"
            ></Input>
            <Button
              variant="tertiary"
              icon={<SearchIcon />}
              onClick={(e) => {
                e.preventDefault();
                handleUserSearch(searchRef.current!.value);
              }}
              type="submit"
              data-cy="submit-user-search"
              aria-label="submit user search query"
            ></Button>
          </form>
          <HelperText>
            <small>Search by display name, user principal or email</small>
          </HelperText>
        </div>
      )}

      {searchErrorMessage !== "" && (
        <Alert type="error">
          <AlertMessage>{searchErrorMessage}</AlertMessage>
        </Alert>
      )}
      {!isAdmin && <Callout construction />}
      {canSearch &&
        searchTerm.length > 0 &&
        (!users || users.length === 0 ? (
          <Box>
            <div className={styles["no-users-found"]}>
              {searchTerm.length > 2
                ? `No users found for "${searchTerm}". Try another query`
                : "No users found, try another query"}
            </div>
            {errorMessage && (
              <Alert type="error">
                <AlertMessage>{errorMessage}</AlertMessage>
              </Alert>
            )}
          </Box>
        ) : (
          !errorMessage &&
          !searchErrorMessage && (
            <>
              <h3 className={styles["results-heading"]}>Results for &ldquo;{searchTerm}&rdquo;</h3>
              <UserDataTable canEdit={isAdmin!} users={users} setUsers={setUsers} isLoading={isLoading} />
            </>
          )
        ))}
    </>
  );
}
