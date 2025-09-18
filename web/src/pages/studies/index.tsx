import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getStudies, Study } from "@/openapi";

import MetaHead from "@/components/meta/Head";
import Studies from "@/components/studies/Studies";
import Button from "@/components/ui/Button";
import Title from "@/components/ui/Title";
import InfoTooltip from "@/components/ui/InfoTooltip";
import LoginFallback from "@/components/ui/LoginFallback";
import Loading from "@/components/ui/Loading";

import styles from "./StudiesPage.module.css";
import Callout from "@/components/ui/Callout";
import StudySelection from "@/components/studies/StudySelection";

export default function StudiesPage() {
  const { authInProgress, isAuthed, userData } = useAuth();
  const [studies, setStudies] = useState<Study[]>([]);
  const [studiesLoading, setStudiesLoading] = useState(true);

  const isApprovedResearcher = userData?.roles.includes("approved-researcher");
  const isAdmin = userData?.roles.includes("admin");

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
    if (!isApprovedResearcher && !isAdmin) return;
    fetchStudies();
  }, [isApprovedResearcher, isAdmin]);

  if (authInProgress) return null;
  if (!isAuthed) return <LoginFallback />;

  return (
    <>
      <MetaHead
        title="Studies | ARC Services Portal"
        description="View and modify studies in the ARC Services Portal"
      />
      <Title text={"Studies"} centered />

      <Callout definition>
        Studies are a top level entity. They can contain <strong>projects</strong>
        <InfoTooltip text="Projects are owned by a study and can contain assets" />
        and <strong>assets</strong>
        <InfoTooltip text="Assets can be owned directly by a study or by a project within a study" />, for more detailed
        information and an entity relationship diagram, look at our
        <Button href="/glossary" variant="tertiary" size="small" inline>
          Glossary
        </Button>
      </Callout>

      <Callout
        construction
        text="Please be aware this site is under development and features may change. This means any data you create may be lost. "
      >
        <span>
          If you require a more stable record of your study, you can fill out the{" "}
          <a href="https://liveuclac.sharepoint.com/sites/ISD.IGAdvisoryService/Lists/Start%20a%20service%20request/NewForm.aspx">
            IG form{" "}
          </a>
        </span>
      </Callout>

      {isAdmin && <StudySelection studies={studies} isAdmin={true} />}

      {!isAdmin && !isApprovedResearcher && (
        <div className={styles["not-approved-section"]}>
          <h2>
            To create and manage your studies, please first set up your profile by completing the approved researcher
            process.
          </h2>

          <Button href="/profile" size="large">
            Complete your profile
          </Button>
        </div>
      )}

      {!isAdmin && isApprovedResearcher && studiesLoading && <Loading message="Loading studies..." />}

      {!isAdmin && isApprovedResearcher && !studiesLoading && (
        <Studies userData={userData!} studies={studies} fetchStudies={fetchStudies} />
      )}
    </>
  );
}
