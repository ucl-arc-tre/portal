import styles from "./index.module.css";
import MetaHead from "@/components/meta/Head";
import Notifications from "@/components/index/Notifications";
import Title from "@/components/ui/Title";
import { useAuth } from "@/hooks/useAuth";
import LoginFallback from "@/components/ui/LoginFallback";

const nonIAODescription = `You can:\n
  • Register and manage your studies
  • Maintain information asset registers for research data
  • Upload agreements and training records
  • Manage study team members and access rights
  • Request access to research systems and services
`;

export default function Index() {
  const { authInProgress, isAuthed, userData, isIAO } = useAuth();

  if (authInProgress) return null;

  if (!isAuthed || !userData) return <LoginFallback />;

  return (
    <>
      <MetaHead title="ARC Services Portal | UCL" description="ARC Services Portal homepage" />

      <div className={styles.title}>
        <Title
          text={"Welcome to the ARC Services Portal"}
          centered
          description={`Use this portal to register studies, manage data assets and contracts,\nand administer access to UCL research services. ${!isIAO && nonIAODescription}`}
        />
      </div>

      <Notifications />
    </>
  );
}
