import { Auth } from "@/openapi";
import IGOpsStudies from "./IGOpsStudies";
import ResearcherStudies from "./ResearcherStudies";

type Props = {
  userData: Auth;
};

export default function Studies({ userData }: Props) {
  if (userData.roles.includes("ig-ops-staff")) {
    return <IGOpsStudies userData={userData} />;
  }

  // default studies view for normal researcher users
  return <ResearcherStudies userData={userData} />;
}
