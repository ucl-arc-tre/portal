import { getUsers, UserData } from "@/openapi";
import { useEffect, useState } from "react";
import styles from "./AdminView.module.css";
import ApprovedResearcherImport from "./ApprovedResearcherImport";
import ExternalInvite from "./ExternalInvite";
import UserDataTable from "./UserDataTable";
import { Alert, AlertMessage } from "../shared/exports";
import Box from "../ui/Box";

export default function AdminView() {
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

  if (!users || users.length === 0)
    return (
      <Box>
        <div>No users found</div>
        {errorMessage && (
          <Alert type="error">
            <AlertMessage>{errorMessage}</AlertMessage>
          </Alert>
        )}
      </Box>
    );

  return (
    <>
      <div className={styles["button-container"]}>
        <ApprovedResearcherImport />
        <ExternalInvite />
      </div>

      <UserDataTable canEdit={true} users={users} setUsers={setUsers} isLoading={isLoading} />
    </>
  );
}
