import PageHeader from "@/components/ui/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import AllStudies from "./AllStudies";
import ResearcherStudies from "./ResearcherStudies";
import styles from "./Studies.module.css";
import Button from "../ui/Button";
import { InfoIcon } from "../ui/uikitExports";
import { StudyDefinition } from "@/components/shared/entityDefinitions";
import { useReducer, useState } from "react";
import StudyForm from "./study-form/StudyForm";
import HelperBlock from "../ui/HelperBlock";

const helperText = `Use this page to view, register and manage research Studies that you have access to.\n Select a Study to view its details, manage governance records, Assets, Contracts, Projects and Study team access, or complete outstanding actions.`;

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
        <Button
          onClick={() => setInfoCalloutExpanded(!infoCalloutExpanded)}
          variant="tertiary"
          size="small"
          inline
          aria-label="Toggle study definition"
          aria-expanded={infoCalloutExpanded}
        >
          <InfoIcon />
        </Button>
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
      <HelperBlock text={helperText} />

      {canSeeAllStudies ? (
        <AllStudies refreshToken={refreshToken} />
      ) : (
        <ResearcherStudies refreshToken={refreshToken} />
      )}
    </div>
  );
}
