import MetaHead from "@/components/meta/Head";
import ApprovedResearcherImport from "@/components/people/ApprovedResearcherImport";
import ExternalInvite from "@/components/people/ExternalInvite";
import LoginFallback from "@/components/ui/LoginFallback";
import Title from "@/components/ui/Title";
import { useAuth } from "@/hooks/useAuth";
import styles from "./PeoplePage.module.css";
import { useEffect, useRef, useState } from "react";
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
  const [originalUsers, setOriginalUsers] = useState<Array<UserData> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchErrorMessage, setSearchErrorMessage] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const fetchPeople = async () => {
    setIsLoading(true);
    try {
      const response = await getUsers();
      if (response.response.ok && response.data) {
        setOriginalUsers(response.data);
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
  useEffect(() => {
    fetchPeople();
  }, []);

  if (authInProgress) return null;

  if (!isAuthed) return <LoginFallback />;

  const isAdmin = userData?.roles.includes("admin");
  const isIAO = userData?.roles.includes("information-asset-owner");
  const isTreOpsStaff = userData?.roles.includes("tre-ops-staff");
  const canSearch = isTreOpsStaff || isAdmin;

  const handleUserSearch = async (query: string) => {
    if (query === "") {
      setUsers(originalUsers);
      setSearchErrorMessage("");
      setSearchTerm("");
      return;
    }

    const regex = /^\w[\w.\s0-9@-]+\w$/;
    const isValid = new RegExp(regex).test(query);

    if (!isValid) {
      console.log(query, query.length);
      if (query.length < 3) {
        setSearchErrorMessage("Not enough characters; there's a minimum of 3 characters required to perform search");
      } else {
        setSearchErrorMessage("Invalid query, only alphanumeric characters, numbers, @ and - are allowed");
      }
      return;
    }

    const response = await getUsers({ query: { find: query } });

    if (!response.response.ok || !response.data) {
      setSearchErrorMessage("Oops, something went wrong with your search. Refresh and try again");
      return;
    }
    setSearchTerm(query);
    setUsers(response.data);
    setSearchErrorMessage("");
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
      {!users || users.length === 0 ? (
        <Box>
          <div className={styles["no-users-found"]}>
            {searchTerm.length > 2
              ? `No users found for "${searchTerm}". Try another query`
              : searchTerm.length > 0
                ? "No users found, try another query"
                : "No users found"}
          </div>
          {errorMessage && (
            <Alert type="error">
              <AlertMessage>{errorMessage}</AlertMessage>
            </Alert>
          )}
        </Box>
      ) : (
        <>
          <br></br>
          {canSearch && searchTerm.length > 0 && (
            <>
              <HelperText>Results for &ldquo;{searchTerm}&rdquo;</HelperText>
              <UserDataTable canEdit={isAdmin!} users={users} setUsers={setUsers} isLoading={isLoading} />
            </>
          )}
        </>
      )}
    </>
  );
}
