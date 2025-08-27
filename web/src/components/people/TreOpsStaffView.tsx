import { useEffect, useState } from "react";
import Callout from "../ui/Callout";
import { getUsers, UserData } from "@/openapi";
import UserDataTable from "./UserDataTable";
import { Alert, AlertMessage } from "../shared/exports";
import Box from "../ui/Box";

export default function TreOpsStaffView() {
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
      <Callout construction />
      <UserDataTable canEdit={false} users={users} setUsers={setUsers} isLoading={isLoading} />
    </>
  );
}
