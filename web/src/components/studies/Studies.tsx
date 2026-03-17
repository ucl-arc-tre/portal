import { useAuth } from "@/hooks/useAuth";
import IGOpsStudies from "./IGOpsStudies";
import ResearcherStudies from "./ResearcherStudies";

export default function Studies() {
  const { userData } = useAuth();
  if (!userData) return null;

  if (userData.roles.includes("ig-ops-staff")) {
    return <IGOpsStudies />;
  }

  return <ResearcherStudies />;
}
