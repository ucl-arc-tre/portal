import { useEffect, useState } from "react";
import Callout from "../ui/Callout";
import { getUsers, UserData } from "@/openapi";
import styles from "./TreOpsStaffView.module.css";
import Loading from "../ui/Loading";
import UserDataTable from "./UserDataTable";

export default function TreOpsStaffView() {
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

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Loading message="Loading users..." />
      </div>
    );
  }
  return (
    <>
      <Callout construction />
      <UserDataTable canEdit={false} users={users} setUsers={setUsers} isLoading={isLoading} />
    </>
  );
}
