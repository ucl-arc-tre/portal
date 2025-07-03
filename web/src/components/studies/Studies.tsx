import { useAuth } from "@/hooks/useAuth";
import LoginFallback from "@/components/ui/LoginFallback";
import Title from "@/components/ui/Title";
import Button from "../ui/Button";
import styles from "./Studies.module.css";
import ApprovedResearcherView from "./ApprovedResearcherView";

export default function Studies() {
  const { authInProgress, isAuthed, userData } = useAuth();
  if (authInProgress) return null;

  if (!isAuthed) return <LoginFallback />;

  const isApprovedResearcher = userData?.roles.includes("approved-researcher");

  return (
    <>
      <Title text={"Studies"} />
      <h5>
        Studies are a top level entity. They can contain projects and assets, for more information, look at our
        <Button href="/glossary#studies" variant="tertiary" size="small" className={styles["glossary-button"]}>
          Glossary
        </Button>
      </h5>

      <p>This page is being built. Please check back soon for updates!</p>

      {isApprovedResearcher && <ApprovedResearcherView />}
    </>
  );
}
