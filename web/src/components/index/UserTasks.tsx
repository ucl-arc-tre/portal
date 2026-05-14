import { useAuth } from "@/hooks/useAuth";
import LoginFallback from "@/components/ui/LoginFallback";
import Loading from "@/components/ui/Loading";
import { useEffect, useState } from "react";
import { getProfile, getStudies, Study } from "@/openapi";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";
import Button from "@/components/ui/Button";
import styles from "./UserTasks.module.css";
import { AlertMessage, Alert } from "../shared/uikitExports";
import { studySignoffWarningRequired } from "../shared/exports";

export default function UserTasks() {
  const { authInProgress, isAuthed, userData } = useAuth();
  const [chosenName, setChosenName] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPendingStudies, setHasPendingStudies] = useState(false);
  const [studiesRequiringSignoff, setStudiesRequiringSignoff] = useState<Study[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isIGOpsStaff = userData?.roles.includes("ig-ops-staff");
  const isApprovedResearcher = userData?.roles.includes("approved-researcher");
  const isIAO = userData?.roles.includes("information-asset-owner");

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await getProfile();

        if (responseIsError(response) || !response.data) {
          const errorMsg = extractErrorMessage(response);
          setError(`Failed to load profile: ${errorMsg}`);
          setChosenName("");
          return;
        }
        setChosenName(response.data.chosen_name || "");
      } catch (error) {
        console.error("Failed to get profile:", error);
        setError("Failed to load profile. Please try again later.");
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
        if (responseIsError(response) || !response.data) {
          const errorMsg = extractErrorMessage(response);
          setError(`Failed to load pending studies: ${errorMsg}`);
          return;
        }
        if (response.data.length > 0) {
          setHasPendingStudies(true);
        }
      } catch (error) {
        console.error("Failed to get pending studies:", error);
        setError("Failed to load pending studies. Please try again later.");
      }
    };
    if (isIGOpsStaff) fetchPendingStudies();
  }, [isIGOpsStaff]);

  useEffect(() => {
    const fetchStudiesRequiringSignoff = async () => {
      try {
        const response = await getStudies({ query: { status: "Approved" } });
        if (responseIsError(response) || !response.data) {
          const errorMsg = extractErrorMessage(response);
          setError(`Failed to load studies: ${errorMsg}`);
          return;
        }
        const due = response.data.filter(
          (study) =>
            study.owner_username === userData?.username &&
            study.last_signoff != null &&
            studySignoffWarningRequired(study.last_signoff)
        );
        setStudiesRequiringSignoff(due);
      } catch (error) {
        console.error("Failed to get studies requiring signoff:", error);
        setError("Failed to load studies. Please try again later.");
      }
    };
    if (isIAO) fetchStudiesRequiringSignoff();
  }, [isIAO, userData?.username]);

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

      {error && (
        <Alert type="error">
          <AlertMessage>{error}</AlertMessage>
        </Alert>
      )}

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
            <>
              {studiesRequiringSignoff.length > 0 ? (
                <>
                  {studiesRequiringSignoff.map((study) => (
                    <div key={study.id} className={styles["signoff-task"]}>
                      <p>
                        Study confirmation is due for <strong>{study.title}</strong>.
                      </p>

                      <Button href={`/studies/manage?studyId=${study.id}`} size="small">
                        Review Study
                      </Button>
                    </div>
                  ))}
                </>
              ) : (
                <p>You have completed all your tasks.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
