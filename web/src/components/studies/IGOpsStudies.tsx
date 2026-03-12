import { useEffect, useState } from "react";
import { Study, Auth, getStudies } from "@/openapi";
import StudyCardsList from "./StudyCardsList";
import Button from "@/components/ui/Button";
import { extractErrorMessage } from "@/lib/errorHandler";
import styles from "./IGOpsStudies.module.css";
import Loading from "../ui/Loading";
import { Alert, AlertMessage } from "../shared/uikitExports";

type Props = {
  userData: Auth;
};

export default function IGOpsStudies({ userData }: Props) {
  const [isLoading, setStudiesLoading] = useState(true);
  const [studies, setStudies] = useState<Study[]>([]);
  const [pendingStudies, setPendingStudies] = useState<Study[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tab, setTab] = useState("pending");

  const isIgOpsStaff = userData.roles.includes("ig-ops-staff");

  useEffect(() => {
    const fetchPendingStudies = async () => {
      setStudiesLoading(true);
      setErrorMessage(null);
      try {
        const response = await getStudies({ query: { status: "Pending" } });
        if (!response.response.ok || !response.data) {
          setErrorMessage(`Failed to fetch pending studies: ${extractErrorMessage(response)}`);
          return;
        }
        setPendingStudies(response.data);
      } catch (error) {
        console.error("Failed to get pending studies:", error);
        setErrorMessage("Failed to get pending studies. Please try again.");
      } finally {
        setStudiesLoading(false);
      }
    };

    fetchPendingStudies();
  }, []);

  const handleAllStudiesClick = async () => {
    setTab("all");
    if (!studies.length) {
      setStudiesLoading(true);
      setErrorMessage(null);
      try {
        const response = await getStudies();
        if (!response.response.ok || !response.data) {
          setErrorMessage(`Failed to fetch studies: ${extractErrorMessage(response)}`);
          return;
        }
        setStudies(response.data);
      } catch (error) {
        console.error("Failed to fetch studies:", error);
        setErrorMessage("Failed to fetch studies. Please try again.");
      } finally {
        setStudiesLoading(false);
      }
    }
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
      {tab === "pending" && <h2>Studies to Review</h2>}
      {tab === "all" && <h2>All Studies</h2>}

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

      {tab === "pending" && pendingStudies.length === 0 ? (
        <div className={styles["no-studies-message"]}>
          <h2>No studies pending approval</h2>
        </div>
      ) : tab === "all" && studies.length === 0 ? (
        <div className={styles["no-studies-message"]}>
          <h2>No studies found</h2>
        </div>
      ) : (
        <StudyCardsList
          studies={tab === "pending" ? pendingStudies : studies}
          isIGOpsStaff={isIgOpsStaff}
          canSeeAll={true}
        />
      )}
    </>
  );
}
