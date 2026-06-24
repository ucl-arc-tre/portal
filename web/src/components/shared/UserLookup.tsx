import { useEffect, useState } from "react";
import { Alert, AlertTitle, AlertMessage, Input, Label } from "./uikitExports";
import Button from "../ui/Button";
import { getUsers, UserData } from "@/openapi";
import styles from "./UserLookup.module.css";
import Loading from "../ui/Loading";

type UserLookupProps = {
  filterByApprovedResearchers: boolean;
  usernames: StudyFormData["additionalStudyAdminUsernames"];
};
export default function UserLookup(props: UserLookupProps) {
  const { filterByApprovedResearchers, usernames } = props;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserData[]>([]);
  const [searchErrorMessage, setSearchErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [noResultsFound, setNoResultsFound] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<UserData[]>([]);

  useEffect(() => {
    const fetchSelectedUsers = async () => {
      if (usernames.length > 0) {
        setIsLoading(true);
        try {
          const response = await getUsers({
            query: {
              find: usernames.map((u) => u.value).join(","),
              is_approved_researcher: filterByApprovedResearchers,
            },
          });
          const results = response?.data || [];
          setSelectedUsers(results);
        } catch (error) {
          console.error("Failed to fetch selected users from usernames:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchSelectedUsers();
  }, [usernames, filterByApprovedResearchers]);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    const regex = /^\w[a-zA-Z0-9\-\.+@_\s]+\w$/;
    const isValid = new RegExp(regex).test(query);

    if (!isValid) {
      setSearchErrorMessage("Invalid query, only alphanumeric characters, @ and - are allowed");
      return;
    }
    try {
      const response = await getUsers({ query: { find: query, is_approved_researcher: filterByApprovedResearchers } });
      const results = response?.data || [];
      setSearchResults(results);
      setNoResultsFound(results.length === 0);
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
  };

  const handleRemoveUser = (user: UserData) => {
    setSelectedUsers(selectedUsers.filter((u) => u.user.id !== user.user.id));
    document
      .getElementById("search-results")
      ?.querySelector(`[data-id="${user.user.id}"]`)
      ?.classList.remove(styles.hidden);
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
                  <Button size="small" variant="secondary" onClick={() => handleRemoveUser(result)}>
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
        <Button onClick={() => handleSearch(searchQuery)} disabled={isLoading || searchQuery.length < 3}>
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
              <Button size="small" variant="secondary">
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
                    <Button size="small" variant="secondary" onClick={() => handleAddUser(result)}>
                      + Add
                    </Button>
                  </AlertMessage>
                </Alert>
              </div>
            ))}
          </div>
        ) : null)}

      {searchErrorMessage !== "" && (
        <Alert type="error">
          <AlertMessage>{searchErrorMessage}</AlertMessage>
        </Alert>
      )}
    </>
  );
}
