import { useAuth } from "@/hooks/useAuth";
import LoginFallback from "@/components/ui/LoginFallback";
import { useEffect, useState } from "react";
import { getProfile } from "@/openapi";
import Button from "@/components/ui/Button";
import styles from "./UserTasks.module.css";

export default function UserTasks() {
  const { authInProgress, isAuthed, userData } = useAuth();
  const [chosenName, setChosenName] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();

        if (response.response.ok && response.data?.chosen_name) {
          setChosenName(response.data.chosen_name);
        } else {
          setChosenName("");
        }
      } catch (error) {
        console.error("Failed to get profile:", error);
        setChosenName("");
      }
    };
    if (isAuthed) {
      fetchProfile();
    }
  }, [isAuthed]);

  if (authInProgress) return null;

  if (!isAuthed || !userData) return <LoginFallback />;

  return (
    <div className={styles.container}>
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
      ) : (
        <div className={styles["user-info"]}>
          <p>
            <strong>Name:</strong> {chosenName}
          </p>
          <p>
            <strong>Username:</strong> {userData.username}
          </p>
          <p>
            <strong>Roles:</strong> {userData.roles.join(", ")}
          </p>

          {!userData.roles.includes("approved-researcher") && (
            <div className={styles["researcher-prompt"]}>
              <p>Complete your profile setup to become an approved researcher.</p>
              <Button href="/profile" variant="secondary">
                Continue Profile Setup
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
