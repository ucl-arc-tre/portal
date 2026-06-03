import { useAuth } from "@/hooks/useAuth";
import IGOpsStudies from "./IGOpsStudies";
import ResearcherStudies from "./ResearcherStudies";
import styles from "./Studies.module.css";
import Button from "../ui/Button";
import { InfoIcon } from "../shared/uikitExports";
import { StudyDefinition } from "@/components/shared/entityDefinitions";
import { useState } from "react";
import StudyForm from "./study-form/StudyForm";

export default function Studies() {
  const { userData } = useAuth();

  const [infoCalloutExpanded, setInfoCalloutExpanded] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const isOpsStaff = userData?.roles.includes("ig-ops-staff") ?? false;
  const isApprovedStaffResearcher = userData?.roles.includes("approved-staff-researcher") ?? false;

  if (!userData) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>
          {isOpsStaff ? "Studies" : "Your Studies"}{" "}
          <Button onClick={() => setInfoCalloutExpanded(!infoCalloutExpanded)} variant="tertiary" size="small" inline>
            <InfoIcon />
          </Button>
        </h2>

        {isApprovedStaffResearcher && isFormOpen && (
          <StudyForm
            username={userData.username}
            setIsFormOpen={setIsFormOpen}
            onComplete={() => setIsFormOpen(false)}
          />
        )}

        {isApprovedStaffResearcher && process.env.NEXT_PUBLIC_ENABLE_STUDY_CREATION === "true" && (
          <div className={styles["create-study-section"]}>
            <Button onClick={() => setIsFormOpen(true)} size="medium" data-cy="create-study-button">
              Create Study
            </Button>
          </div>
        )}
      </div>
      <div className={styles.line}></div>

      {infoCalloutExpanded && <StudyDefinition />}

      {isOpsStaff ? <IGOpsStudies /> : <ResearcherStudies />}
    </div>
  );
}
