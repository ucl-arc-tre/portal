import Button from "./Button";
import styles from "./LoginFallback.module.css";

export default function LoginFallback({
  title = "Access Restricted",
  message = "You must be logged in to view this page.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className={styles.wrapper}>
      <h1>{title}</h1>
      <p>{message}</p>

      <Button size="large" href={`/oauth2/start?`} cy="login">
        Login with UCL SSO
      </Button>
    </div>
  );
}
