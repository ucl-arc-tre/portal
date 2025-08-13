import { getUsers, UserData } from "@/openapi";
import { useEffect, useState } from "react";
import styles from "./AdminView.module.css";
import ApprovedResearcherImport from "./ApprovedResearcherImport";
import ExternalInvite from "./ExternalInvite";
import UserDataTable from "./UserDataTable";

export default function AdminView() {
  const [users, setUsers] = useState<Array<UserData> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        setUsers(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPeople();
  }, []);

  if (!users) return null;

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
