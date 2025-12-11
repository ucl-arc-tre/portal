import { useAuth } from "@/hooks/useAuth";
import LoginFallback from "@/components/ui/LoginFallback";
import Loading from "@/components/ui/Loading";
import { useEffect, useState } from "react";
import { getProfile, getStudies } from "@/openapi";
import Button from "@/components/ui/Button";
import styles from "./UserTasks.module.css";

export default function UserTasks() {
  const { authInProgress, isAuthed, userData } = useAuth();
  const [chosenName, setChosenName] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPendingStudies, setHasPendingStudies] = useState(false);

  const isIGOpsStaff = userData?.roles.includes("ig-ops-staff");
  const isApprovedResearcher = userData?.roles.includes("approved-researcher");

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    };
    if (isAuthed) {
      fetchProfile();
    }
  }, [isAuthed]);

  useEffect(() => {
    const fetchPendingStudies = async () => {
      try {
        const response = await getStudies({ query: { status: "Pending" } });
        if (response.response.ok) {
          if (response.data && response.data.length > 0) {
            setHasPendingStudies(true);
          }
        }
      } catch (error) {
        console.error("Failed to get pending studies:", error);
      }
    };
    if (isIGOpsStaff) fetchPendingStudies();
  }, [isIGOpsStaff]);

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
      ) : !isApprovedResearcher ? (
        <div className={styles["researcher-prompt"]}>
          <p>Complete your profile setup to become an approved researcher.</p>
          <Button href="/profile" variant="secondary">
            Continue Profile Setup
          </Button>
        </div>
      ) : (
        <div className={styles["completed-tasks"]}>
          {isIGOpsStaff ? (
            <>
              {hasPendingStudies ? (
                <>
                  <p>There are studies to approve, check out the Studies page.</p>
                  <Button href="/studies" size="large">
                    View Studies
                  </Button>
                </>
              ) : (
                <p>You&apos;re all caught up! There are no studies to approve.</p>
              )}
            </>
          ) : (
            <p>You have completed all your tasks.</p>
          )}
        </div>
      )}
    </div>
  );
}
