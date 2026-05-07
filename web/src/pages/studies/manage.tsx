import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { Study, getStudiesByStudyId } from "@/openapi";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";

import MetaHead from "@/components/meta/Head";
import ManageStudy from "@/components/studies/manage/ManageStudy";
import Title from "@/components/ui/Title";
import LoginFallback from "@/components/ui/LoginFallback";
import Loading from "@/components/ui/Loading";
import Button from "@/components/ui/Button";

import styles from "./ManageStudyPage.module.css";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Callout from "@/components/ui/Callout";

const defaultMeta = (
  <MetaHead title="Manage Study | ARC Services Portal" description="Manage your study in the ARC Services Portal" />
);

export default function ManageStudyPage() {
  const router = useRouter();
  const { studyId } = router.query;
  const { authInProgress, isAuthed, userData } = useAuth();
  const [study, setStudy] = useState<Study | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isApprovedResearcher = userData?.roles.includes("approved-researcher") ?? false;

  const fetchStudy = async (id: string) => {
    if (!study) setIsLoading(true);
    setError(null);

    try {
      const response = await getStudiesByStudyId({ path: { studyId: id } });
      if (responseIsError(response) || !response.data) {
        setError(extractErrorMessage(response));
        return;
      }
      setStudy(response.data);
    } catch (error) {
      console.error("Failed to fetch study:", error);
      setError("Failed to load study. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (studyId == undefined || !isApprovedResearcher) return;
    fetchStudy(studyId as string);
  }, [studyId, isApprovedResearcher]);

  if (authInProgress) return null;
  if (!isAuthed) return <LoginFallback />;

  if (process.env.NEXT_PUBLIC_ENABLE_STUDIES !== "true") {
    return (
      <>
        {defaultMeta}
        <Callout construction>
          <span>Studies are still under construction.</span>
        </Callout>
      </>
    );
  }

  if (!isApprovedResearcher) {
    return (
      <>
        {defaultMeta}
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

  if (!studyId) {
    return (
      <>
        {defaultMeta}
        <div className={styles["not-found-section"]}>
          <h2>Study ID not provided</h2>
          <p>Please go back to your studies list and select a study to manage.</p>
          <div className={styles["navigation-action"]}>
            <Button onClick={() => router.push("/studies")} variant="secondary">
              Back to Studies
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        {defaultMeta}
        <Loading message="Loading study..." />
      </>
    );
  }

  if (error) {
    return (
      <>
        {defaultMeta}
        <div className={styles["error-section"]}>
          <h2>Error Loading Study</h2>
          <p>{error}</p>
          <div className={styles["error-recovery-actions"]}>
            <Button onClick={() => router.push("/studies")} variant="secondary">
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

      <Breadcrumbs
        links={[
          { title: "Studies", url: "/studies" },
          { title: study.title, url: `/studies/manage?studyId=${study.id}` },
        ]}
      />

      <Title text={`Manage Study: ${study.title}`} centered />

      <div className="content">
        <ManageStudy study={study} fetchStudy={fetchStudy} />
      </div>
    </>
  );
}
