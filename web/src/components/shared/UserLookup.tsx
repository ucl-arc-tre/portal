import { useState } from "react";
import { Alert, AlertTitle, AlertMessage, Input } from "./uikitExports";
import Button from "../ui/Button";
import { getUsers, UserData } from "@/openapi";
import styles from "./UserLookup.module.css";
import Loading from "../ui/Loading";

type UserLookupProps = {
  filterByApprovedResearchers: boolean;
};
export default function UserLookup(props: UserLookupProps) {
  const { filterByApprovedResearchers } = props;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserData[]>([]);
  const [searchErrorMessage, setSearchErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [noResultsFound, setNoResultsFound] = useState(false);

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

  return (
    <>
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
          <div>
            {searchResults.map((result) => (
              <div key={result.user.id}>
                <Alert type="success" className={styles["user-result"]}>
                  <AlertTitle>{result.chosen_name}</AlertTitle>
                  <AlertMessage className={styles["user-result-content"]}>
                    {result.user.username}
                    <Button size="small" variant="secondary">
                      Add
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
