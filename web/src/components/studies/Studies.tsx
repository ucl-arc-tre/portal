import { useAuth } from "@/hooks/useAuth";
import IGOpsStudies from "./IGOpsStudies";
import ResearcherStudies from "./ResearcherStudies";
import styles from "./Studies.module.css";
import Button from "../ui/Button";
import { InfoIcon } from "../shared/uikitExports";
import { StudyDefinition } from "@/components/shared/entityDefinitions";
import { useState } from "react";

export default function Studies() {
  const { userData } = useAuth();

  const isOpsStaff = userData?.roles.includes("ig-ops-staff");
  const [infoCalloutExpanded, setInfoCalloutExpanded] = useState(false);

  if (!userData) return null;

  return (
    <div className={styles.container}>
      <h2 className={styles["studies-heading"]}>
        {isOpsStaff ? "Studies" : "Your Studies"}{" "}
        <Button onClick={() => setInfoCalloutExpanded(!infoCalloutExpanded)} variant="tertiary" size="small" inline>
          <InfoIcon />
        </Button>
      </h2>

      {infoCalloutExpanded && <StudyDefinition />}

      {isOpsStaff ? <IGOpsStudies /> : <ResearcherStudies />}
    </div>
  );
}
