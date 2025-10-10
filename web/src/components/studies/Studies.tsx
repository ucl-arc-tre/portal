import { useEffect, useState } from "react";
import { Study, Auth, getStudies } from "@/openapi";
import StudySelection from "../studies/StudySelection";
import StudyForm from "./StudyForm";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";

import styles from "./Studies.module.css";
import Loading from "../ui/Loading";

type Props = {
  userData: Auth;
};

export default function Studies(props: Props) {
  const { userData } = props;
  const [studyFormOpen, setStudyFormOpen] = useState(false);
  const [showUclStaffModal, setShowUclStaffModal] = useState(false);
  const [studiesLoading, setStudiesLoading] = useState(true);
  const [studies, setStudies] = useState<Study[]>([]);

  const fetchStudies = async () => {
    setStudiesLoading(true);
    try {
      const response = await getStudies();
      setStudies(response.data || []);
    } catch (error) {
      console.error("Failed to fetch studies:", error);
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

  return (
    <>
      {studyFormOpen && (
        <StudyForm username={userData.username} setStudyFormOpen={setStudyFormOpen} fetchStudies={fetchStudies} />
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

          <StudySelection studies={studies} isAdmin={false} />
        </>
      )}
    </>
  );
}
