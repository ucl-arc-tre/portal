import { useAuth } from "@/hooks/useAuth";
import IGOpsStudies from "./IGOpsStudies";
import ResearcherStudies from "./ResearcherStudies";
import styles from "./Studies.module.css";
import Button from "../ui/Button";
import { InfoIcon } from "../shared/uikitExports";
import { StudyDefinition } from "@/components/shared/entityDefinitions";
import { useReducer, useState } from "react";
import StudyForm from "./study-form/StudyForm";

export default function Studies() {
  const { userData, isIGStaff, isApprovedStaffResearcher } = useAuth();

  const [infoCalloutExpanded, setInfoCalloutExpanded] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refreshToken, refreshStudies] = useReducer((x) => x + 1, 0);

  if (!userData) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>
          {isIGStaff ? "Studies" : "Your Studies"}{" "}
          <Button
            onClick={() => setInfoCalloutExpanded(!infoCalloutExpanded)}
            variant="tertiary"
            size="small"
            inline
            aria-label="Toggle study definition"
          >
            <InfoIcon />
          </Button>
        </h2>

        {isApprovedStaffResearcher && isFormOpen && (
          <StudyForm
            username={userData.username}
            setIsFormOpen={setIsFormOpen}
            onComplete={() => {
              setIsFormOpen(false);
              refreshStudies();
            }}
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

      {isIGStaff ? <IGOpsStudies refreshToken={refreshToken} /> : <ResearcherStudies refreshToken={refreshToken} />}
    </div>
  );
}
