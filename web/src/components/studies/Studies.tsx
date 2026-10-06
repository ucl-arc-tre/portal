import PageHeader from "@/components/ui/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import AllStudies from "./AllStudies";
import ResearcherStudies from "./ResearcherStudies";
import styles from "./Studies.module.css";
import Button from "../ui/Button";
import { StudyDefinition } from "@/components/shared/entityDefinitions";
import { useReducer, useState } from "react";
import StudyForm from "./study-form/StudyForm";

export default function Studies() {
  const { userData, isApprovedStaffResearcher, canSeeAllStudies } = useAuth();

  const [infoCalloutExpanded, setInfoCalloutExpanded] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refreshToken, refreshStudies] = useReducer((x) => x + 1, 0);

  if (!userData) return null;

  return (
    <div className={styles.container}>
      <PageHeader
        title={canSeeAllStudies ? "All Studies" : "Your Studies"}
        info={{
          label: "Toggle study definition",
          expanded: infoCalloutExpanded,
          onToggle: () => setInfoCalloutExpanded(!infoCalloutExpanded),
        }}
      >
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
      </PageHeader>

      {infoCalloutExpanded && <StudyDefinition />}

      {canSeeAllStudies ? (
        <AllStudies refreshToken={refreshToken} />
      ) : (
        <ResearcherStudies refreshToken={refreshToken} />
      )}
    </div>
  );
}
