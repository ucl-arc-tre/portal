import { useAuth } from "@/hooks/useAuth";

import MetaHead from "@/components/meta/Head";
import Studies from "@/components/studies/Studies";
import Button from "@/components/ui/Button";
import Title from "@/components/ui/Title";
import LoginFallback from "@/components/ui/LoginFallback";

import styles from "./StudiesPage.module.css";
import Callout from "@/components/ui/Callout";
import { StudyDefinition } from "@/components/shared/entityDefinitions";

export default function StudiesPage() {
  const { authInProgress, isAuthed, userData } = useAuth();
  const isApprovedResearcher = userData?.roles.includes("approved-researcher");

  if (authInProgress) return null;
  if (!isAuthed) return <LoginFallback />;

  return (
    <>
      <MetaHead
        title="Studies | ARC Services Portal"
        description="View and modify studies in the ARC Services Portal"
      />
      <Title text={"Studies"} centered />

      <StudyDefinition />

      {process.env.NEXT_PUBLIC_ENABLE_STUDY_CREATION !== "true" && (
        <Callout construction>
          <span>
            Studies are still under construction. Please use the existing{" "}
            <a href="https://liveuclac.sharepoint.com/sites/ISD.IGAdvisoryService/Lists/Start%20a%20service%20request/NewForm.aspx">
              IG form
            </a>{" "}
            to create a study.
          </span>
        </Callout>
      )}

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

      {isApprovedResearcher && <Studies />}
    </>
  );
}
