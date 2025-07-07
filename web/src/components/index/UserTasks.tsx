import { useAuth } from "@/hooks/useAuth";
import LoginFallback from "@/components/ui/LoginFallback";
import Loading from "@/components/ui/Loading";
import { useEffect, useState } from "react";
import { getUserIdentity } from "@/openapi";
import Button from "@/components/ui/Button";
import styles from "./UserTasks.module.css";

export default function UserTasks() {
  const { authInProgress, isAuthed, userData } = useAuth();
  const [chosenName, setChosenName] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  console.log(userData);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await getUserIdentity();

        if (response.response.ok && response.data?.chosen_name) {
          setChosenName(response.data.chosen_name);
        } else {
          setChosenName("");
        }
      } catch (error) {
        console.error("Failed to get profile:", error);
        setChosenName("");
      } finally {
        setIsLoading(false);
      }
    };
    if (isAuthed) {
      fetchProfile();
    }
  }, [isAuthed]);

  if (authInProgress) return null;

  if (!isAuthed || !userData) return <LoginFallback />;

  if (isLoading) {
    return (
      <div className={styles.container}>
        <h2>Your Tasks</h2>
        <Loading message="Loading your tasks..." />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2>Your Tasks</h2>

      {!chosenName ? (
        <div className={styles["setup-prompt"]}>
          <h3>Complete Your Profile Setup</h3>
          <p>
            To get started with ARC services, please complete your profile setup including setting your chosen name.
          </p>
          <Button href="/profile" size="large">
            Complete Profile Setup
          </Button>
        </div>
      ) : !userData.roles.includes("approved-researcher") ? (
        <div className={styles["researcher-prompt"]}>
          <p>Complete your profile setup to become an approved researcher.</p>
          <Button href="/profile" variant="secondary">
            Continue Profile Setup
          </Button>
        </div>
      ) : (
        <div className={styles["completed-tasks"]}>
          <p>You have completed all your tasks.</p>
        </div>
      )}
    </div>
  );
}
