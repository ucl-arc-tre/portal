import { useAuth } from "@/hooks/useAuth";
import LoginFallback from "@/components/ui/LoginFallback";
import Loading from "@/components/ui/Loading";
import { useEffect, useState } from "react";
import {
  getNotifications,
  Notification,
  postNotificationsByNotificationIdRead,
  deleteNotificationsByNotificationId,
  postNotificationsRead,
} from "@/openapi";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";
import Button from "@/components/ui/Button";
import styles from "./Notifications.module.css";
import Error from "../ui/Error";
import { CheckIcon, IconButton, XIcon } from "../shared/uikitExports";
import router from "next/router";

export default function Notifications() {
  const { authInProgress, isAuthed, userData, isApprovedResearcher } = useAuth();
  const [notifications, setNotifications] = useState<Notification[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeProfileNotification = notifications?.find((notification) => notification.kind === "complete-profile");
  const needToCompleteProfile = completeProfileNotification !== undefined;
  const unreadCount = notifications?.filter((notification) => !notification.read).length ?? 0;

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
      setError("Failed to load notifications. Please try again later.");
      setNotifications(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthed) {
      fetchNotifications();
    }
  }, [isAuthed]);

  const readNotification = async (notification: Notification) => {
    if (notification.read) return;

    try {
      const response = await postNotificationsByNotificationIdRead({ path: { notificationId: notification.id } });
      if (responseIsError(response)) {
        setError(`Failed to mark notification as read: ${extractErrorMessage(response)}`);
        return;
      }
      setNotifications((currentNotifications) =>
        currentNotifications?.map((currentNotification) =>
          currentNotification.id === notification.id ? { ...currentNotification, read: true } : currentNotification
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const dismissNotification = async (notification: Notification) => {
    try {
      const response = await deleteNotificationsByNotificationId({ path: { notificationId: notification.id } });
      if (responseIsError(response)) {
        setError(`Failed to clear notification: ${extractErrorMessage(response)}`);
        return;
      }
      setNotifications(notifications?.filter((existingNotification) => existingNotification.id !== notification.id));
    } catch (error) {
      console.error("Failed to clear notification:", error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const response = await postNotificationsRead({ body: {} });
      if (responseIsError(response)) {
        setError(`Failed to mark notifications as read: ${extractErrorMessage(response)}`);
        return;
      }
      setNotifications((currentNotifications) =>
        currentNotifications?.map((notification) => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  if (authInProgress) return null;

  if (!isAuthed || !userData) return <LoginFallback />;

  if (isLoading) {
    return (
      <div className={styles.container}>
        <h2>Your Notifications</h2>
        <Loading message="Loading your notifications..." />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h2>Your Notifications</h2>
          {notifications && notifications.length > 0 && !needToCompleteProfile && (
            <p className={styles.summary} aria-live="polite">
              {unreadCount === 0 ? "You're all caught up" : `${unreadCount} unread`}
            </p>
          )}
        </div>
        {unreadCount > 0 && !needToCompleteProfile && (
          <Button variant="secondary" size="xsmall" onClick={markAllNotificationsAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {error && <Error message={error} />}

      {needToCompleteProfile ? (
        <div className={styles["setup-prompt"]}>
          <h3>Complete Your Profile Setup</h3>
          <p>
            To get started with ARC services, please complete your profile setup including setting your chosen name.
          </p>
          <Button href="/profile" variant="secondary">
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
        <ul className={styles.notificationsList}>
          {notifications.map((notification) => {
            const stateClass = notification.read ? styles.read : styles.unread;

            return (
              <li className={`${styles.notification} ${stateClass}`} key={notification.id}>
                <span className={styles.stateIndicator} aria-hidden="true" />
                <div className={styles.notificationContent}>
                  {!notification.read && <span className={styles.status}>Unread</span>}
                  <button
                    className={styles.notificationLink}
                    type="button"
                    onClick={() => {
                      if (notification.href) {
                        router.push(notification.href);
                      }
                      readNotification(notification);
                    }}
                  >
                    <span className={styles.notificationTitle}>{notification.title}</span>
                    {notification.body && <span className={styles.notificationBody}>{notification.body}</span>}
                  </button>
                </div>
                <div className={styles.notificationActions}>
                  {!notification.read && (
                    <IconButton
                      className={styles.iconButton}
                      aria-label={`Mark “${notification.title}” as read`}
                      title="Mark as read"
                      onClick={() => readNotification(notification)}
                    >
                      <CheckIcon aria-hidden="true" size={22} />
                    </IconButton>
                  )}
                  <IconButton
                    className={styles.iconButton}
                    aria-label={`Dismiss “${notification.title}”`}
                    title="Dismiss"
                    onClick={() => dismissNotification(notification)}
                  >
                    <XIcon aria-hidden="true" size={22} />
                  </IconButton>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {notifications && notifications.length === 0 && (
        <div className={styles["completed-notifications"]}>
          <p>There are no notifications.</p>
        </div>
      )}
    </div>
  );
}
