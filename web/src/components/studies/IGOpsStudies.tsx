import { useEffect, useState } from "react";
import { Study, getStudies } from "@/openapi";
import StudyCardsList from "./StudyCardsList";
import Button from "@/components/ui/Button";
import { extractErrorMessage } from "@/lib/errorHandler";
import styles from "./IGOpsStudies.module.css";
import Loading from "../ui/Loading";
import { Alert, AlertMessage } from "../shared/uikitExports";

export default function IGOpsStudies() {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setError] = useState<string | null>(null);
  const [studies, setStudies] = useState<Study[]>([]);
  const [pendingStudies, setPendingStudies] = useState<Study[]>([]);
  const [tab, setTab] = useState("pending");

  const currentStudies = tab === "pending" ? pendingStudies : studies;

  useEffect(() => {
    // fetch pending studies on load since that's the default tab
    const fetchPendingStudies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getStudies({ query: { status: "Pending" } });
        if (!response.response.ok || !response.data) {
          setError(`Failed to fetch pending studies: ${extractErrorMessage(response)}`);
          return;
        }
        setPendingStudies(response.data);
      } catch (error) {
        console.error("Failed to get pending studies:", error);
        setError("Failed to get pending studies. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingStudies();
  }, []);

  const getAllStudies = async () => {
    if (studies.length) return; // if we already have all studies, no need to fetch again

    setIsLoading(true);
    setError(null);
    try {
      const response = await getStudies();
      if (!response.response.ok || !response.data) {
        setError(`Failed to fetch studies: ${extractErrorMessage(response)}`);
        return;
      }
      setStudies(response.data);
    } catch (error) {
      console.error("Failed to fetch studies:", error);
      setError("Failed to fetch studies. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAllStudiesClick = async () => {
    setTab("all");
    getAllStudies();
  };

  if (errorMessage) {
    return (
      <Alert type="error">
        <AlertMessage>{errorMessage}</AlertMessage>
      </Alert>
    );
  }

  return (
    <>
      <h2>{tab === "pending" ? "Studies to Review" : "All Studies"}</h2>

      <div className={"tab-collection"}>
        <Button
          onClick={() => setTab("pending")}
          variant="secondary"
          className={`tab ${tab === "pending" ? "active" : ""}`}
        >
          Pending Studies
        </Button>

        <Button
          onClick={handleAllStudiesClick}
          variant="secondary"
          className={`tab ${tab === "all" ? "active" : ""}`}
          data-cy="all-studies-tab-button"
        >
          All Studies
        </Button>
      </div>

      {isLoading && <Loading message="Loading studies..." />}

      {!isLoading && currentStudies.length === 0 && (
        <div className={styles["no-studies-message"]}>
          <h2>No studies found</h2>
        </div>
      )}

      {currentStudies.length > 0 && <StudyCardsList studies={currentStudies} />}
    </>
  );
}
