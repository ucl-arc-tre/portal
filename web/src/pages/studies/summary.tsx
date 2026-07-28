import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { Study, getStudiesByStudyId } from "@/openapi";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";
import MetaHead from "@/components/meta/Head";
import LoginFallback from "@/components/ui/LoginFallback";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import StudyOverview from "@/components/studies/manage/StudyOverview";

export default function SummaryStudyPage() {
  const router = useRouter();
  const { studyId } = router.query;
  const { authInProgress, isAuthed } = useAuth();
  const [study, setStudy] = useState<Study | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (studyId) {
      fetchStudy(studyId as string);
    }
  }, [studyId]);

  if (authInProgress) return null;
  if (!isAuthed) return <LoginFallback />;

  if (!studyId) {
    router.push("/studies");
    return;
  }

  return (
    <>
      <MetaHead title="Study | ARC Services Portal" description="View a study in the ARC Services Portal" />

      <Breadcrumbs
        links={[
          { title: "Studies", url: "/studies" },
          { title: study?.title || "None", url: `/studies/summary?studyId=${study?.id}` },
        ]}
      />

      <div className="content">
        {error && <Error message={error} />}
        {isLoading && <Loading message="Loading study..." />}
        {study && <StudyOverview study={study} fetchStudy={fetchStudy} />}
      </div>
    </>
  );
}
