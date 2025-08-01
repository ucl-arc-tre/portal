import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { Study } from "@/openapi";

import MetaHead from "@/components/meta/Head";
import ManageStudy from "@/components/studies/ManageStudy";
import Title from "@/components/ui/Title";
import LoginFallback from "@/components/ui/LoginFallback";
import Loading from "@/components/ui/Loading";
import Button from "@/components/ui/Button";

import styles from "./ManageStudyPage.module.css";

export default function ManageStudyPage() {
  const router = useRouter();
  const { studyId } = router.query;
  const { authInProgress, isAuthed, userData } = useAuth();
  const [study, setStudy] = useState<Study | null>(null);
  const [studyLoading, setStudyLoading] = useState(true);
  const [studyError, setStudyError] = useState<string | null>(null);

  const isApprovedResearcher = userData?.roles.includes("approved-researcher");

  const fetchStudy = async (id: string) => {
    setStudyLoading(true);
    setStudyError(null);
    try {
      // TODO: Implement getStudy API call when available
      console.log(`Fetching study with ID: ${id}`);
      setStudy(null); // Placeholder
    } catch (error) {
      console.error("Failed to fetch study:", error);
      setStudyError("Failed to load study. Please try again.");
    } finally {
      setStudyLoading(false);
    }
  };

  useEffect(() => {
    if (!studyId || !isApprovedResearcher) return;
    fetchStudy(studyId as string);
  }, [studyId, isApprovedResearcher]);

  if (authInProgress) return null;
  if (!isAuthed) return <LoginFallback />;

  if (!isApprovedResearcher) {
    return (
      <>
        <MetaHead
          title="Manage Study | ARC Services Portal"
          description="Manage your study in the ARC Services Portal"
        />

        <div className={styles["not-approved-section"]}>
          <h2>To manage studies, please first set up your profile by completing the approved researcher process.</h2>
          <div className={styles["profile-completion-action"]}>
            <Button onClick={() => router.push("/profile")} size="large">
              Complete your profile
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (studyLoading) {
    return (
      <>
        <MetaHead
          title="Manage Study | ARC Services Portal"
          description="Manage your study in the ARC Services Portal"
        />
        <Loading message="Loading study..." />
      </>
    );
  }

  if (studyError) {
    return (
      <>
        <MetaHead
          title="Manage Study | ARC Services Portal"
          description="Manage your study in the ARC Services Portal"
        />

        <div className={styles["error-section"]}>
          <h2>Error Loading Study</h2>
          <p>{studyError}</p>
          <div className={styles["error-recovery-actions"]}>
            <Button onClick={() => router.back()} variant="secondary">
              Back to Studies
            </Button>
            <Button onClick={() => fetchStudy(studyId as string)}>Try Again</Button>
          </div>
        </div>
      </>
    );
  }

  if (!study) {
    return (
      <>
        <MetaHead
          title="Study Not Found | ARC Services Portal"
          description="Study not found in the ARC Services Portal"
        />
        <div className={styles["not-found-section"]}>
          <h2>Study Not Found</h2>
          <p>The study you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
          <div className={styles["navigation-action"]}>
            <Button onClick={() => router.push("/studies")} variant="secondary">
              Back to Studies
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <MetaHead
        title={`Manage ${study.title} | ARC Services Portal`}
        description={`Manage your study "${study.title}" in the ARC Services Portal`}
      />
      <Title text={`Manage Study: ${study.title}`} />

      <div>
        <Button onClick={() => router.push("/studies")} variant="tertiary" size="small">
          ← Back to Studies
        </Button>
      </div>

      <ManageStudy study={study} userData={userData!} />
    </>
  );
}
