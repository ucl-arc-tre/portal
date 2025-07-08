import { useAuth } from "@/hooks/useAuth";
import LoginFallback from "@/components/ui/LoginFallback";
import ApprovedResearcherView from "./ApprovedResearcherView";
import Button from "../ui/Button";

export default function Studies() {
  const { authInProgress, isAuthed, userData } = useAuth();
  if (authInProgress) return null;

  if (!isAuthed) return <LoginFallback />;

  const isApprovedResearcher = userData?.roles.includes("approved-researcher");
  const isAdmin = userData?.roles.includes("admin");

  const username = userData!.username;

  return (
    <>
      {!isAdmin && !isApprovedResearcher && (
        <>
          <h2>No Studies</h2>
          <p>
            You need to be an Approved Researcher to view and create Studies. Check your{" "}
            <Button size="small" href="/profile" variant="tertiary">
              profile
            </Button>{" "}
            for steps to become an Approved Researcher
          </p>
        </>
      )}

      {isApprovedResearcher && <ApprovedResearcherView username={username} />}
    </>
  );
}
