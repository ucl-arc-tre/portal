import { Auth } from "@/openapi";
import IGOpsStudies from "./IGOpsStudies";
import ResearcherStudies from "./ResearcherStudies";

type Props = {
  userData: Auth;
};

export default function Studies({ userData }: Props) {
  const isIgOpsStaff = userData.roles.includes("ig-ops-staff");

  if (userData.roles.includes("ig-ops-staff")) {
    return <IGOpsStudies isIgOpsStaff={isIgOpsStaff} />;
  }

  // default studies view for normal researcher users
  return <ResearcherStudies userData={userData} />;
}
