import { useAuth } from "@/hooks/useAuth";
import { getUsers, UserData } from "@/openapi";
import { useState } from "react";
import Loading from "../ui/Loading";
import Box from "../ui/Box";
import Error from "../ui/Error";
import UsersList from "./UsersList";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";
import Search from "../ui/Search";
import { HelperText } from "../shared/uikitExports";
import styles from "./Search.module.css";

export default function PeopleSearch() {
  const { authInProgress, isAuthed } = useAuth();
  const [users, setUsers] = useState<Array<UserData> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchErrorMessage, setSearchErrorMessage] = useState("");

  const handleUserSearch = async (query: string) => {
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

    setIsLoading(true);
    try {
      const response = await getUsers({ query: { find: query } });

      if (responseIsError(response) || !response.data) {
        setErrorMessage(`Failed to search users: ${extractErrorMessage(response)}`);
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

  if (authInProgress || !isAuthed) return null;

  return (
    <>
      <div className={styles["search-wrapper"]}>
        <Search placeholder="Search users..." onSearch={handleUserSearch} id="user-search" />
        <HelperText>
          <small>Search by user&apos;s name, email address or user principal</small>
        </HelperText>
      </div>
      {searchErrorMessage && <Error message={searchErrorMessage} />}
      {errorMessage && <Error message={errorMessage} />}
      {isLoading && <Loading />}

      {searchTerm.length > 0 &&
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
            <UsersList users={users} />
          </>
        ))}
    </>
  );
}
