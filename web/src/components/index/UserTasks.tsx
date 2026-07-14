import { useAuth } from "@/hooks/useAuth";
import LoginFallback from "@/components/ui/LoginFallback";
import Loading from "@/components/ui/Loading";
import { useEffect, useState } from "react";
import {
  getNotifications,
  Notification,
  postNotificationsByNotificationIdRead,
  postNotificationsRead,
} from "@/openapi";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";
import Button from "@/components/ui/Button";
import styles from "./UserTasks.module.css";
import { AlertMessage, Alert, IconButton, XIcon } from "../shared/uikitExports";
import router from "next/router";

export default function UserTasks() {
  const { authInProgress, isAuthed, userData } = useAuth();
  const [notifications, setNotifications] = useState<Notification[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isApprovedResearcher = userData?.roles.includes("approved-researcher");
  const completeProfileNotification = notifications?.find((notification) => notification.kind === "complete-profile");
  const needToCompleteProfile = completeProfileNotification !== undefined;

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const response = await getNotifications();

        if (responseIsError(response)) {
          const errorMsg = extractErrorMessage(response);
          setError(`Failed to load notifications: ${errorMsg}`);
          setNotifications(undefined);
          return;
        }
        setNotifications(response.data);
      } catch (error) {
        console.error("Failed to get notifications:", error);
        setError("Failed to notifications. Please try again later.");
        setNotifications(undefined);
      } finally {
        setIsLoading(false);
      }
    };
    if (isAuthed) {
      fetchNotifications();
    }
  }, [isAuthed]);

  const clearNotification = async (notification: Notification) => {
    try {
      const response = await postNotificationsByNotificationIdRead({ path: { notificationId: notification.id } });
      if (responseIsError(response)) {
        setError(`Failed to clear notification: ${extractErrorMessage(response)}`);
        return;
      }
      setNotifications(notifications?.filter((existingNotification) => existingNotification.id !== notification.id));
    } catch (error) {
      console.error("Failed to clear notification:", error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const response = await postNotificationsRead({ body: {} });
      if (responseIsError(response)) {
        setError(`Failed to clear notification: ${extractErrorMessage(response)}`);
        return;
      }
      setNotifications([]);
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  };

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
      <div className={styles["header"]}>
        <h2>Your Tasks</h2>
        {notifications && notifications.length > 0 && !needToCompleteProfile && (
          <Button
            variant="secondary"
            size="xsmall"
            onClick={() => {
              clearAllNotifications();
            }}
          >
            Clear All
          </Button>
        )}
      </div>

      {error && (
        <Alert type="error">
          <AlertMessage>{error}</AlertMessage>
        </Alert>
      )}

      {needToCompleteProfile ? (
        <div className={styles["setup-prompt"]}>
          <h3>Complete Your Profile Setup</h3>
          <p>
            To get started with ARC services, please complete your profile setup including setting your chosen name.
          </p>
          <Button href="/profile" variant="secondary" onClick={() => clearNotification(completeProfileNotification!)}>
            Complete Profile Setup
          </Button>
        </div>
      ) : (
        !isApprovedResearcher && (
          <div className={styles["researcher-prompt"]}>
            <p>Complete your profile setup to become an approved researcher.</p>
            <Button href="/profile" variant="secondary">
              Become an Approved Researcher
            </Button>
          </div>
        )
      )}
      {!needToCompleteProfile && notifications && notifications.length > 0 && (
        <div className={styles["tasks"]}>
          {notifications.map((notification) => (
            <div className={styles["task"]} key={notification.id}>
              <a
                onClick={() => {
                  if (notification.href) {
                    router.push(notification.href);
                  }
                  clearNotification(notification);
                }}
              >
                <p>{notification.title}</p>
              </a>
              <IconButton aria-label={"dissmss notification"} onClick={() => clearNotification(notification)}>
                <XIcon aria-hidden="true" size={24} />
              </IconButton>
            </div>
          ))}
        </div>
      )}
      {notifications && notifications.length === 0 && (
        <div className={styles["completed-tasks"]}>
          <p>You have completed all your tasks.</p>
        </div>
      )}
    </div>
  );
}
