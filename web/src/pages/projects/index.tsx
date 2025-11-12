import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import MetaHead from "@/components/meta/Head";
import Projects from "@/components/projects/Projects";
import LoginFallback from "@/components/ui/LoginFallback";
import Button from "@/components/ui/Button";
import Callout from "@/components/ui/Callout";
import Title from "@/components/ui/Title";

import styles from "./ProjectsPage.module.css";

export default function ProjectsPage() {
  const router = useRouter();
  const { authInProgress, isAuthed, userData } = useAuth();

  const isApprovedResearcher = userData?.roles.includes("approved-researcher");

  if (authInProgress) return null;
  if (!isAuthed) return <LoginFallback />;

  if (!isApprovedResearcher) {
    return (
      <>
        <MetaHead
          title="Manage Projects | ARC Services Portal"
          description="Manage your projects in the ARC Services Portal"
        />
        <div className={styles["not-approved-section"]}>
          <h2>To manage projects, please first set up your profile by completing the approved researcher process.</h2>
          <div className={styles["profile-completion-action"]}>
            <Button onClick={() => router.push("/profile")} size="large">
              Complete your profile
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <MetaHead
        title="Projects | ARC Services Portal"
        description="View and modify projects in the ARC Services Portal"
      />

      <Title text={"Projects"} centered />

      <Callout definition>
        A project belongs to a study and can contain multiple assets. Have a look at our
        <Button href="/glossary" variant="tertiary" size="small" inline>
          Glossary
        </Button>
        for more detailed information.
      </Callout>

      <Callout construction>
        Not all project features work yet. We&apos;re actively working on adding more functionality!
      </Callout>

      <Projects />
    </>
  );
}
