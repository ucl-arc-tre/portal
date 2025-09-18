import styles from "./index.module.css";
import MetaHead from "@/components/meta/Head";
import UserTasks from "@/components/index/UserTasks";
import Title from "@/components/ui/Title";
import StudySelection from "@/components/studies/StudySelection";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getStudies, Study } from "@/openapi";
import Loading from "@/components/ui/Loading";
import Box from "@/components/ui/Box";
import LoginFallback from "@/components/ui/LoginFallback";

export default function Index() {
  const { isAuthed, authInProgress, userData } = useAuth();

  const [tasksCompleted, setTasksCompleted] = useState(false);
  const [studies, setStudies] = useState<Study[]>([]);
  const [studiesLoading, setStudiesLoading] = useState(true);

  const isAdmin = userData?.roles.includes("admin");

  const fetchStudies = async () => {
    setStudiesLoading(true);
    try {
      const response = await getStudies();

      const pendingStudies = response.data?.filter((s) => s.approval_status === "Pending");
      setStudies(pendingStudies || []);
    } catch (error) {
      console.error("Failed to fetch studies:", error);
      setStudies([]);
    } finally {
      setStudiesLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchStudies();
  }, [isAdmin]);

  useEffect(() => {
    if (isAuthed && userData && userData.roles.includes("approved-researcher")) {
      setTasksCompleted(true);
    }
  }, [isAuthed, userData, setTasksCompleted]);

  if (authInProgress) return null;

  if (!isAuthed || !userData) return <LoginFallback />;

  return (
    <>
      <MetaHead title="ARC Services Portal | UCL" description="ARC Services Portal homepage" />

      <div className={styles.title}>
        <Title
          text={"Welcome to the ARC Services Portal"}
          centered
          description={"This portal allows UCL researchers to manage ARC services and tasks"}
        />
      </div>

      <div className={styles["task-wrapper"]}>
        {(!tasksCompleted || (tasksCompleted && !isAdmin)) && <UserTasks setTasksCompleted={setTasksCompleted} />}
        {tasksCompleted && isAdmin && studiesLoading ? (
          <Loading message="Loading studies..." />
        ) : (
          isAdmin && (
            <Box>
              <div className={styles["studies-wrapper"]}>
                <h2>Studies to Approve</h2>
                <StudySelection isAdmin={isAdmin || false} studies={studies} />
                {studies.length === 0 && <p>You&apos;re all caught up! No studies to approve</p>}
              </div>
            </Box>
          )
        )}
      </div>
    </>
  );
}
