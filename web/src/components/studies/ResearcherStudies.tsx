import { useEffect, useState } from "react";
import { Study, getStudies } from "@/openapi";
import StudyCardsList from "./StudyCardsList";
import StudyForm from "./study-form/StudyForm";
import Button from "@/components/ui/Button";
import Loading from "../ui/Loading";
import { Alert, AlertMessage } from "../shared/uikitExports";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";
import { useAuth } from "@/hooks/useAuth";

import styles from "./ResearcherStudies.module.css";

export default function ResearcherStudies() {
  const { userData } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [studies, setStudies] = useState<Study[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const isApprovedStaffResearcher = userData?.roles.includes("approved-staff-researcher") ?? false;

  const fetchStudies = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getStudies();
      if (responseIsError(response) || !response.data) {
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

  const onComplete = () => {
    setIsFormOpen(false);
    fetchStudies();
  };

  if (!userData) return null;

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

  return (
    <>
      {isApprovedStaffResearcher && isFormOpen && (
        <StudyForm username={userData.username} setIsFormOpen={setIsFormOpen} onComplete={onComplete} />
      )}

      {isApprovedStaffResearcher && (
        <div className={styles["create-study-section"]}>
          <Button onClick={() => setIsFormOpen(true)} size="large" data-cy="create-study-button">
            Create New Study
          </Button>
        </div>
      )}

      {studies.length === 0 && isApprovedStaffResearcher && (
        <div className={styles["no-studies-message"]}>
          <h2>No studies found</h2>
          <p>Any studies you create will appear here.</p>
        </div>
      )}

      {studies.length === 0 && !isApprovedStaffResearcher && (
        <div className={styles["no-studies-message"]}>
          <h2>You haven&apos;t been added to any studies yet</h2>
          <p>Any studies you are added to will appear here once they have been created by a member of staff.</p>
        </div>
      )}

      {studies.length > 0 && <StudyCardsList studies={studies} />}
    </>
  );
}
