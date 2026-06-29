import { useEffect, useState } from "react";
import { Alert, AlertTitle, AlertMessage, Input, Label } from "./uikitExports";
import Button from "../ui/Button";
import { getUsers, postUsersInvite, UserData } from "@/openapi";
import styles from "./UserLookup.module.css";
import Loading from "../ui/Loading";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";
import { ProjectFormData } from "@/types/projects";

type UserLookupProps = {
  filterByApprovedResearchers: boolean;
  usernames: StudyFormData["additionalStudyAdminUsernames"] | ProjectFormData["members"];
  appendUsername: (value: string) => void;
  removeUsername: (username: string) => void;
  studyName?: string;
  projectName?: string;
  limit?: number;
};
export default function UserLookup(props: UserLookupProps) {
  const {
    filterByApprovedResearchers,
    usernames,
    appendUsername,
    removeUsername,
    studyName,
    projectName,
    limit = 5,
  } = props;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserData[]>([]);
  const [searchErrorMessage, setSearchErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [noResultsFound, setNoResultsFound] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<UserData[]>([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [inviteErrorMessage, setInviteErrorMessage] = useState("");

  const regex = /^\w[a-zA-Z0-9\-\.+@_\s]+\w$/;

  useEffect(() => {
    const fetchSelectedUsers = async () => {
      if (usernames.length === 0) {
        setSelectedUsers([]);
        setNoResultsFound(false);
        return;
      }

      setIsLoading(true);
      const fetchedUsers: UserData[] = [];

      for (const username of usernames) {
        try {
          const response = await getUsers({
            query: {
              find: "value" in username ? username.value : username.username,
              is_approved_researcher: filterByApprovedResearchers,
            },
          });
          const results = response?.data || [];
          fetchedUsers.push(...results);
        } catch (error) {
          console.error("Failed to fetch selected users from usernames:", error);
        }
      }

      setSelectedUsers(fetchedUsers);
      setIsLoading(false);
    };
    fetchSelectedUsers();
  }, [usernames, filterByApprovedResearchers]);

  const handleSearch = async (query: string) => {
    setSearchErrorMessage("");
    setIsLoading(true);

    const isValid = new RegExp(regex).test(query);

    if (!isValid) {
      setSearchErrorMessage("Invalid query, only alphanumeric characters, @ and - are allowed");
      return;
    }
    try {
      const response = await getUsers({ query: { find: query, is_approved_researcher: filterByApprovedResearchers } });
      if (responseIsError(response)) {
        const errorMsg = extractErrorMessage(response);
        setSearchErrorMessage(errorMsg);
        return;
      }
      const results = response?.data || [];
      setSearchResults(results);
      setNoResultsFound(results.length === 0);

      if (results.length > 0 && usernames.length > 0) {
        setSearchResults(
          results.filter(
            (result) => !usernames.some((u) => ("value" in u ? u.value : u.username) === result.user.username)
          )
        );
      }
    } catch (error) {
      console.error("Failed to search users:", error);
      setNoResultsFound(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = (user: UserData) => {
    if (!selectedUsers.some((u) => u.user.id === user.user.id)) {
      setSelectedUsers([...selectedUsers, user]);
      // hiding with CSS rather than removing from list so it shows up again if removed from selected users
      document
        .getElementById("search-results")
        ?.querySelector(`[data-id="${user.user.id}"]`)
        ?.classList.add(styles.hidden);
    }
    if (!usernames.some((u) => ("value" in u ? u.value : u.username) === user.user.username)) {
      appendUsername(user.user.username);
    }
  };

  const handleRemoveUser = (user: UserData) => {
    setSelectedUsers(selectedUsers.filter((u) => u.user.id !== user.user.id));
    document
      .getElementById("search-results")
      ?.querySelector(`[data-id="${user.user.id}"]`)
      ?.classList.remove(styles.hidden);
    const index = usernames.findIndex((u) => ("value" in u ? u.value : u.username) === user.user.username);
    if (index !== -1) {
      removeUsername(user.user.username);
    }
    console.log(selectedUsers);
  };

  const handleSendInvite = async (email: string) => {
    setInviteErrorMessage("");
    setInviteLoading(true);
    const isValid = new RegExp(regex).test(email);
    if (!isValid) {
      setInviteErrorMessage("Invalid entry, only alphanumeric characters, @ and - are allowed");
      return;
    }
    try {
      const response = await postUsersInvite({
        body: { email: email, study_name: studyName, project_name: projectName },
      });
      if (responseIsError(response)) {
        const errorMsg = extractErrorMessage(response);
        setInviteErrorMessage(errorMsg);
        return;
      }
      setInviteErrorMessage("");
      setSuccessMessage("Invite sent");
      setSearchQuery("");
    } catch (err) {
      console.error("Invite post error:", err);
      setInviteErrorMessage("Failed to send invitation. Please try again.");
    } finally {
      setInviteLoading(false);
    }
  };
  return (
    <>
      {selectedUsers.length > 0 && (
        <div className={styles["selected-users"]}>
          <Label>Selected Users</Label>
          {selectedUsers.map((result) => (
            <div key={result.user.id}>
              <Alert type="success" className={styles["user-result"]}>
                <AlertTitle>{result.chosen_name}</AlertTitle>
                <AlertMessage className={styles["user-result-content"]}>
                  {result.user.username}
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => handleRemoveUser(result)}
                    data-cy="remove-user-from-selection"
                  >
                    x Remove
                  </Button>
                </AlertMessage>
              </Alert>
            </div>
          ))}
        </div>
      )}
      <div className={styles.lookup}>
        <Input
          type="text"
          placeholder={filterByApprovedResearchers ? "Search approved researchers..." : "Search users..."}
          data-cy="user-lookup"
          id="lookup"
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (e.target.value.length < 3) {
              setSearchResults([]);
              setSearchErrorMessage("");
              setNoResultsFound(false);
            }
          }}
          value={searchQuery}
        />
        <Button
          onClick={() => handleSearch(searchQuery)}
          disabled={isLoading || searchQuery.length < 3}
          data-cy="user-lookup-submit"
        >
          Search
        </Button>
      </div>
      {isLoading && (
        <span className={styles.loader}>
          <Loading message="searching users" size="small" />
        </span>
      )}
      {searchQuery.length > 3 &&
        (noResultsFound ? (
          <Alert type="warning" className={styles["user-result"]}>
            &quot;{searchQuery}&quot; not found.{" "}
            {searchQuery.includes("@") && (
              <Button
                size="small"
                variant="secondary"
                onClick={() => handleSendInvite(searchQuery)}
                disabled={inviteLoading && !inviteErrorMessage}
                loading={inviteLoading && !inviteErrorMessage}
                data-cy="invite-user"
              >
                Invite
              </Button>
            )}
          </Alert>
        ) : searchResults.length > 0 ? (
          <div id="search-results">
            {searchResults.map((result) => (
              <div key={result.user.id} data-id={result.user.id}>
                <Alert type="info" className={styles["user-result"]}>
                  <AlertTitle>{result.chosen_name}</AlertTitle>
                  <AlertMessage className={styles["user-result-content"]}>
                    {result.user.username}
                    {selectedUsers.length! <= limit && (
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => handleAddUser(result)}
                        data-cy="add-user-to-selection"
                      >
                        + Add
                      </Button>
                    )}
                  </AlertMessage>
                </Alert>
              </div>
            ))}
          </div>
        ) : null)}

      {(searchErrorMessage || successMessage || inviteErrorMessage) && (
        <Alert type={successMessage ? "success" : "error"}>
          <AlertMessage>{searchErrorMessage || successMessage || inviteErrorMessage}</AlertMessage>
        </Alert>
      )}
    </>
  );
}
