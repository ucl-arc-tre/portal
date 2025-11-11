import { useEffect, useState } from "react";
import { Study, Auth, getStudies } from "@/openapi";
import StudyForm from "./StudyForm";
import StudyCardsList from "./StudyCardsList";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";

import styles from "./Studies.module.css";
import Loading from "../ui/Loading";
import { Alert, AlertMessage } from "../shared/exports";

type Props = {
  userData: Auth;
};

export default function Studies(props: Props) {
  const { userData } = props;
  const [studyFormOpen, setStudyFormOpen] = useState(false);
  const [showUclStaffModal, setShowUclStaffModal] = useState(false);
  const [studiesLoading, setStudiesLoading] = useState(true);
  const [studies, setStudies] = useState<Study[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [tab, setTab] = useState("pending");
  const [pendingStudies, setPendingStudies] = useState<Study[]>([]);

  const isAdmin = userData.roles.includes("admin");

  useEffect(() => {
    const fetchPendingStudies = async () => {
      setStudiesLoading(true);
      try {
        const response = await getStudies({ query: { status: "Pending" } });
        if (response.response.ok && response.data) {
          setPendingStudies(response.data);
        }
      } catch (error) {
        console.error("Failed to get pending studies:", error);
        setErrorMessage("Failed to get pending studies. Please try again.");
      } finally {
        setStudiesLoading(false);
      }
    };
    if (isAdmin) {
      fetchPendingStudies();
    }
  }, [isAdmin]);

  const handleAllStudiesClick = async () => {
    setTab("all");

    if (!studies.length) {
      fetchStudies();
    }
  };

  const handlePendingStudiesClick = async () => {
    setTab("pending");
  };

  const fetchStudies = async () => {
    setStudiesLoading(true);
    try {
      const response = await getStudies();
      setStudies(response.data || []);
    } catch (error) {
      console.error("Failed to fetch studies:", error);
      setErrorMessage("Failed to fetch studies. Please try again.");
      setStudies([]);
    } finally {
      setStudiesLoading(false);
    }
  };

  useEffect(() => {
    fetchStudies();
  }, []);

  const handleCreateStudyClick = () => {
    if (!userData.roles.includes("approved-staff-researcher")) {
      setShowUclStaffModal(true);
      return;
    }
    setStudyFormOpen(true);
  };

  if (errorMessage) {
    return (
      <Alert type="error">
        <AlertMessage>{errorMessage}</AlertMessage>
      </Alert>
    );
  }

  if (isAdmin) {
    return (
      <>
        {tab === "pending" && <h2>Studies to Review</h2>}
        {tab === "all" && <h2>All Studies</h2>}

        <div className={styles["study-tabs"]}>
          <Button
            onClick={handlePendingStudiesClick}
            variant="secondary"
            className={`${styles.tab} ${styles["pending-studies-tab"]} ${tab === "pending" ? styles.active : ""}`}
          >
            Pending Studies
          </Button>
          <Button
            onClick={handleAllStudiesClick}
            variant="secondary"
            className={`${styles.tab} ${styles["all-studies-tab"]} ${tab === "all" ? styles.active : ""}`}
          >
            All Studies
          </Button>
        </div>

        {studiesLoading && <Loading message="Loading studies..." />}

        <StudyCardsList studies={tab === "pending" ? pendingStudies : studies} isAdmin={true} />
      </>
    );
  }

  return (
    <>
      {studyFormOpen && (
        <StudyForm username={userData.username} setStudyFormOpen={setStudyFormOpen} fetchStudyData={fetchStudies} />
      )}

      {showUclStaffModal && (
        <Dialog setDialogOpen={setShowUclStaffModal} cy="ucl-staff-restriction-modal">
          <h2>UCL Staff Only</h2>
          <p>Only UCL staff members can create studies.</p>
          <p>If you believe this is an error, please contact your administrator.</p>
          <div className={styles["ucl-staff-modal-actions"]}>
            <Button onClick={() => setShowUclStaffModal(false)} variant="secondary">
              Close
            </Button>
          </div>
        </Dialog>
      )}
      {studiesLoading && <Loading message="Loading studies..." />}

      {!userData.roles.includes("approved-staff-researcher") && studies.length === 0 ? (
        <div className={styles["no-studies-message"]}>
          <h2>You haven&apos;t been added to any studies yet</h2>
          <p>Any studies you are added to will appear here once they have been created by a member of staff.</p>
        </div>
      ) : studies.length === 0 ? (
        <div className={styles["no-studies-message"]}>
          <h2>You haven&apos;t created any studies yet</h2>

          <Button onClick={handleCreateStudyClick} size="large">
            Create Your First Study
          </Button>
        </div>
      ) : (
        <>
          <div className={styles["create-study-section"]}>
            <Button onClick={handleCreateStudyClick} size="large">
              Create New Study
            </Button>
          </div>

          <StudyCardsList studies={studies} isAdmin={false} />
        </>
      )}
    </>
  );
}
