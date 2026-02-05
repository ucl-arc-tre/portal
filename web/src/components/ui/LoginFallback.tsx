import Button from "./Button";
import { useRouter } from "next/router";
import styles from "./LoginFallback.module.css";

export default function LoginFallback({
  title = "Access Restricted",
  message = "You must be logged in to view this page.",
}: {
  title?: string;
  message?: string;
}) {
  const router = useRouter();
  return (
    <div className={styles.wrapper}>
      <h1>{title}</h1>
      <p>{message}</p>

      <Button
        className={styles.button}
        size="large"
        href={`/oauth2/start?rd=${encodeURIComponent(router.route)}`}
        cy="login"
      >
        Login with UCL SSO
      </Button>
    </div>
  );
}
