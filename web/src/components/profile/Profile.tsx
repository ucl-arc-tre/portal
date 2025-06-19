import { useAuth } from "@/hooks/useAuth";
import LoginFallback from "@/components/ui/LoginFallback";
import Button from "@/components/ui/Button";
import Title from "@/components/ui/Title";
import styles from "./Profile.module.css";

export default function Profile() {
  const { authInProgress, isAuthed, userData } = useAuth();

  if (authInProgress) return null;

  if (!isAuthed) return <LoginFallback />;

  return (
    <>
      <Title text={"Profile"} />

      <h2>Welcome, {userData?.username}!</h2>
      <p>This is your profile. More profile features coming soon.</p>

      {!userData?.roles?.includes("approved-researcher") && (
        <>
          <p className={styles.p}>
            It looks like you are not yet an approved researcher. To get started, follow the link below to start the
            approved researcher process.
          </p>

          <Button className={styles.button} size="large" href="/profile/approved-researcher">
            Become an approved researcher
          </Button>
        </>
      )}
    </>
  );
}
