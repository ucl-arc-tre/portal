import { ReactElement, useEffect, useState } from "react";
import { Alert, AlertMessage, CheckSquareIcon, HelperText, InfoIcon, Input, Label } from "./uikitExports";
import Button from "../ui/Button";
import { getUsers, postUsersInvite, UserData } from "@/openapi";
import styles from "./UserLookup.module.css";
import Loading from "../ui/Loading";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";

const selectedUserCache = new Map<string, Promise<UserData | null>>();
const searchResultsCache = new Map<string, Promise<UserData[]>>();

const normaliseSearchQuery = (query: string) => query.trim().toLowerCase();

const fetchExactUser = (username: string) => {
  const cached = selectedUserCache.get(username);
  if (cached) return cached;

  const request = getUsers({
    query: {
      find: username,
    },
  })
    .then((response) => response?.data?.find((user) => user.user.username === username) ?? null)
    .catch((error) => {
      selectedUserCache.delete(username);
      throw error;
    });

  selectedUserCache.set(username, request);
  return request;
};

const fetchSearchResults = (query: string) => {
  const cacheKey = normaliseSearchQuery(query);
  const cached = searchResultsCache.get(cacheKey);
  if (cached) return cached;

  const request = getUsers({ query: { find: query } })
    .then((response) => {
      if (responseIsError(response)) {
        throw new Error(extractErrorMessage(response));
      }

      return response?.data || [];
    })
    .catch((error) => {
      searchResultsCache.delete(cacheKey);
      throw error;
    });

  searchResultsCache.set(cacheKey, request);
  return request;
};

type UserLookupProps = {
  filterByApprovedResearchers: boolean;
  usernames: string[];
  appendUsername: (value: string) => void;
  removeUsername: (username: string) => void;
  roleControl?: ReactElement | ((user: UserData) => ReactElement | null);
  studyName?: string;
  projectName?: string;
  limit?: number;
  filterExcludeUsername?: string;
};
export default function UserLookup(props: UserLookupProps) {
  const {
    filterByApprovedResearchers,
    usernames,
    appendUsername,
    removeUsername,
    roleControl,
    studyName,
    projectName,
    limit = 100,
    filterExcludeUsername: filterExcludeUsername,
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
  const usernamesKey = usernames.join("\0");

  const regex = /^\w[a-zA-Z0-9\-\.+@_\s]+\w$/;

  useEffect(() => {
    let isActive = true;

    const fetchSelectedUsers = async () => {
      const selectedUsernames = usernamesKey ? usernamesKey.split("\0") : [];

      if (selectedUsernames.length === 0) {
        setSelectedUsers([]);
        setNoResultsFound(false);
        return;
      }

      setIsLoading(true);

      try {
        const fetchedUsers = await Promise.all(selectedUsernames.map(fetchExactUser));
        if (isActive) {
          setSelectedUsers(fetchedUsers.filter((user): user is UserData => user !== null));
        }
      } catch (error) {
        console.error("Failed to fetch selected users from usernames:", error);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };
    fetchSelectedUsers();

    return () => {
      isActive = false;
    };
  }, [usernamesKey]);

  const handleSearch = async (query: string) => {
    setSearchErrorMessage("");

    const isValid = new RegExp(regex).test(query);

    if (!isValid) {
      setSearchErrorMessage("Invalid query, only alphanumeric characters, @ and - are allowed");
      return;
    }

    setIsLoading(true);
    try {
      const results = await fetchSearchResults(query);
      let filteredResults = results;

      if (filterExcludeUsername) {
        filteredResults = filteredResults.filter((result) => result.user.username !== filterExcludeUsername);
      }

      if (filterByApprovedResearchers) {
        filteredResults = filteredResults.filter((result) => result.is_valid_approved_researcher);
      }

      if (usernames.length > 0) {
        filteredResults = filteredResults.filter((result) => !usernames.some((u) => u === result.user.username));
      }

      setSearchResults(filteredResults);
      setNoResultsFound(filteredResults.length === 0);
    } catch (error) {
      console.error("Failed to search users:", error);
      if (error instanceof Error) {
        setSearchErrorMessage(error.message);
      }
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
    if (!usernames.some((u) => u === user.user.username)) {
      appendUsername(user.user.username);
    }
  };

  const handleRemoveUser = (user: UserData) => {
    setSelectedUsers(selectedUsers.filter((u) => u.user.id !== user.user.id));
    document
      .getElementById("search-results")
      ?.querySelector(`[data-id="${user.user.id}"]`)
      ?.classList.remove(styles.hidden);
    const index = usernames.findIndex((u) => u === user.user.username);
    if (index !== -1) {
      removeUsername(user.user.username);
    }
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
      {searchQuery.length >= 3 &&
        (noResultsFound ? (
          <Alert type="warning">
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
              <div className={`${styles["user-item"]} ${styles.result}`} key={result.user.id} data-id={result.user.id}>
                <div className={styles["user-info"]}>
                  <InfoIcon />
                  <div>
                    <h4>{result.chosen_name}</h4>
                    <p>{result.user.username}</p>
                  </div>
                </div>
                {selectedUsers.length < limit && (
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => handleAddUser(result)}
                    data-cy="add-user-to-selection"
                  >
                    + Add
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : null)}

      {selectedUsers.length === 0 ? (
        <HelperText>No users selected</HelperText>
      ) : (
        <div className={styles["selected-users"]}>
          <Label>Selected Users</Label>
          {selectedUsers.map((result) => (
            <div className={`${styles["user-item"]} ${styles.selected}`} key={result.user.id}>
              <div className={styles["user-info"]}>
                <CheckSquareIcon />
                <div>
                  <h4>{result.chosen_name}</h4>
                  <p>{result.user.username}</p>
                </div>
              </div>
              <Button
                size="small"
                variant="secondary-destructive"
                onClick={() => handleRemoveUser(result)}
                data-cy="remove-user-from-selection"
              >
                x Remove
              </Button>
              {roleControl && (
                <div className={styles["role-control"]}>
                  <h5 className={styles["role-heading"]}>Roles</h5>
                  {typeof roleControl === "function" ? roleControl(result) : roleControl}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {(searchErrorMessage || successMessage || inviteErrorMessage) && (
        <Alert type={successMessage ? "success" : "error"}>
          <AlertMessage>{searchErrorMessage || successMessage || inviteErrorMessage}</AlertMessage>
        </Alert>
      )}
    </>
  );
}
