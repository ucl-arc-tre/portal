import Button from "./Button";
import { useRouter } from "next/router";
import styles from "./ApprovedResearcherFallback.module.css";

export default function ApprovedResearcherFallback() {
  const router = useRouter();
  return (
    <div className={styles.wrapper}>
      <h1>Access Restricted</h1>
      <p>You must be an approved researcher in to view this page.</p>

      <Button
        className={styles.button}
        size="large"
        onClick={() => {
          router.push("/profile");
        }}
        cy="login"
      >
        Become and approved resarcher
      </Button>
    </div>
  );
}
