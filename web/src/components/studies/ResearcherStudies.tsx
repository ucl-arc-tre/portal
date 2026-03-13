import { useEffect, useState } from "react";
import { Study, Auth, getStudies } from "@/openapi";
import StudyCardsList from "./StudyCardsList";
import StudyForm from "./StudyForm";
import Button from "@/components/ui/Button";
import { extractErrorMessage } from "@/lib/errorHandler";
import styles from "./ResearcherStudies.module.css";
import Loading from "../ui/Loading";
import { Alert, AlertMessage } from "../shared/uikitExports";

type Props = {
  userData: Auth;
};

export default function ResearcherStudies({ userData }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [studies, setStudies] = useState<Study[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [studyFormOpen, setStudyFormOpen] = useState(false);

  const isApprovedStaffResearcher = userData.roles.includes("approved-staff-researcher");

  const fetchStudies = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getStudies();
      if (!response.response.ok || !response.data) {
        setError(`Failed to fetch studies: ${extractErrorMessage(response)}`);
        setStudies([]);
        return;
      }
      setStudies(response.data);
    } catch (error) {
      console.error("Failed to fetch studies:", error);
      setError("Failed to fetch studies. Please try again.");
      setStudies([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudies();
  }, []);

  if (error) {
    return (
      <Alert type="error">
        <AlertMessage>{error}</AlertMessage>
      </Alert>
    );
  }

  if (isLoading) {
    return <Loading message="Loading studies..." />;
  }

  if (!isApprovedStaffResearcher && studies.length === 0) {
    return (
      <div className={styles["no-studies-message"]}>
        <h2>You haven&apos;t been added to any studies yet</h2>
        <p>Any studies you are added to will appear here once they have been created by a member of staff.</p>
      </div>
    );
  }

  return (
    <>
      {studyFormOpen && (
        <StudyForm username={userData.username} setStudyFormOpen={setStudyFormOpen} fetchStudyData={fetchStudies} />
      )}

      <div className={styles["create-study-section"]}>
        <Button onClick={() => setStudyFormOpen(true)} size="large" data-cy="create-study-button">
          Create New Study
        </Button>
      </div>

      {studies.length === 0 && (
        <div className={styles["no-studies-message"]}>
          <h2>No studies found</h2>
          <p>Any studies you are added to will appear here once they have been created.</p>
        </div>
      )}

      {studies.length > 0 && <StudyCardsList studies={studies} isIGOpsStaff={false} canSeeAll={false} />}
    </>
  );
}
