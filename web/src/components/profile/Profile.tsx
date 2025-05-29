import { useAuth } from "@/hooks/useAuth";
import LoginFallback from "@/components/ui/LoginFallback";
import Button from "@/components/ui/Button";

export default function Profile() {
  const { loading, isAuthed, userData } = useAuth();

  if (loading) return null;

  if (!isAuthed) return <LoginFallback />;

  return (
    <>
      <h2>Welcome, {userData?.username}!</h2>
      <p>This is your profile. More profile features coming soon.</p>

      {!userData?.roles?.includes("approved-researcher") && (
        <>
          <p>
            It looks like you are not yet an approved researcher. To get started, follow the link below to start the
            approved researcher process.
          </p>

          <Button size="large" href="/profile/approved-researcher">
            Become an approved researcher
          </Button>
        </>
      )}
    </>
  );
}
