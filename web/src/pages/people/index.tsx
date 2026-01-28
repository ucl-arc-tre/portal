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
import { Alert, AlertMessage, HelperText } from "@/components/shared/exports";
import UserDataTable from "@/components/people/UserDataTable";
import Callout from "@/components/ui/Callout";
import dynamic from "next/dynamic";
import Button from "@/components/ui/Button";
import Metrics from "@/components/people/Metrics";

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
  const isIGOps = userData?.roles.includes("ig-ops-staff");
  const isIAO = userData?.roles.includes("information-asset-owner");
  const isTreOpsStaff = userData?.roles.includes("tre-ops-staff");
  const canSearch = isTreOpsStaff || isAdmin || isIGOps;
  const canSeeMetrics = isIGOps || isAdmin;

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
    setErrorMessage("");
    setIsLoading(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    searchRef.current!.value = inputValue;
  };

  const clearSearchTerm = () => {
    if (searchRef.current) {
      searchRef.current.value = "";
    }
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
            <input
              placeholder="search users..."
              id={styles.search}
              name="search"
              onChange={handleInputChange}
              ref={searchRef}
              aria-label="search users of the portal"
            ></input>
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
            {searchTerm.length > 0 && (
              <Button
                variant="tertiary"
                onClick={() => {
                  handleUserSearch("");
                  clearSearchTerm();
                }}
                className={styles["clear-search"]}
                type="reset"
                data-cy="clear-user-search"
                aria-label="clear user search query"
              >
                <small>Clear</small>
              </Button>
            )}
          </form>
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
      {!isAdmin && <Callout construction />}
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
      {canSeeMetrics && <Metrics />}
    </>
  );
}
