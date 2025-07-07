import { useAuth } from "@/hooks/useAuth";
import LoginFallback from "@/components/ui/LoginFallback";
import ApprovedResearcherView from "./ApprovedResearcherView";

export default function Studies() {
  const { authInProgress, isAuthed, userData } = useAuth();
  if (authInProgress) return null;

  if (!isAuthed) return <LoginFallback />;

  const isApprovedResearcher = userData?.roles.includes("approved-researcher");
  const isAdmin = userData?.roles.includes("admin");

  const username = userData!.username;

  return (
    <>
      {!isAdmin && !isApprovedResearcher && <p>This page is being built. Please check back soon for updates!</p>}

      {isApprovedResearcher && <ApprovedResearcherView username={username} />}
    </>
  );
}
