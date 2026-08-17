import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import MetaHead from "@/components/meta/Head";
import Projects from "@/components/projects/Projects";
import LoginFallback from "@/components/ui/LoginFallback";
import Button from "@/components/ui/Button";
import Callout from "@/components/ui/Callout";

import styles from "./ProjectsPage.module.css";

export default function ProjectsPage() {
  const router = useRouter();
  const { authInProgress, isAuthed, userData, isApprovedResearcher } = useAuth();

  if (authInProgress) return null;
  if (!isAuthed || !userData) return <LoginFallback />;

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

      <Callout
        construction
        text={
          "Only ARC TRE and Data Safe Haven projects are currently viewable here. We're working to onboard other environments and enable creation."
        }
      />

      <Projects />
    </>
  );
}
