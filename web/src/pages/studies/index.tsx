import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

import MetaHead from "@/components/meta/Head";
import Studies from "@/components/studies/Studies";
import Button from "@/components/ui/Button";
import Title from "@/components/ui/Title";
import InfoTooltip from "@/components/ui/InfoTooltip";
import LoginFallback from "@/components/ui/LoginFallback";
import Loading from "@/components/ui/Loading";

import styles from "./StudiesPage.module.css";

export default function StudiesPage() {
  const { authInProgress, isAuthed, userData } = useAuth();
  const [studies, setStudies] = useState<Study[]>([]);
  const [studiesLoading, setStudiesLoading] = useState(true);

  const isApprovedResearcher = userData?.roles.includes("approved-researcher");

  useEffect(() => {
    if (!isApprovedResearcher) return;

    const fetchStudies = async () => {
      setStudiesLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await getStudies();
        // setStudies(response.data);

        // Dummy data for now
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
        // setStudies([]);
        setStudies([
          {
            id: "1",
            title: "COVID-19 Research Study",
            description: "A comprehensive study on COVID-19 impacts and treatments",
          },
          {
            id: "2",
            title: "Cancer Treatment Analysis",
            description: "Analysis of various cancer treatment methodologies",
          },
        ]);
      } catch (error) {
        console.error("Failed to fetch studies:", error);
        setStudies([]);
      } finally {
        setStudiesLoading(false);
      }
    };

    fetchStudies();
  }, [isApprovedResearcher]);

  if (authInProgress) return null;
  if (!isAuthed) return <LoginFallback />;

  return (
    <>
      <MetaHead
        title="Studies | ARC Services Portal"
        description="View and modify studies in the ARC Services Portal"
      />
      <Title text={"Studies"} />

      <p className={styles["studies-description"]}>
        Studies are a top level entity. They can contain <strong>projects</strong>
        <InfoTooltip text="Projects are owned by a study and can contain assets" />
        and <strong>assets</strong>
        <InfoTooltip text="Assets can be owned directly by a study or by a project within a study" />, for more detailed
        information and an entity relationship diagram, look at our
        <Button href="/glossary" variant="tertiary" size="small" inline>
          Glossary
        </Button>
      </p>

      {!isApprovedResearcher && (
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

      {isApprovedResearcher && studiesLoading && <Loading message="Loading studies..." />}

      {isApprovedResearcher && !studiesLoading && <Studies username={userData!.username} studies={studies} />}
    </>
  );
}
