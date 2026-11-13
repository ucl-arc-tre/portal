import styles from "./index.module.css";
import MetaHead from "@/components/meta/Head";
import Notifications from "@/components/index/Notifications";
import Title from "@/components/ui/Title";
import { useAuth } from "@/hooks/useAuth";
import { HelperText } from "@/components/ui/uikitExports";

export default function Index() {
  const { isAuthed } = useAuth();

  const description = `Use the ARC Services Portal to manage Studies, Study teams, governance records and access to UCL Research Data services.`;

  return (
    <>
      <MetaHead title="ARC Services Portal | UCL" description="ARC Services Portal homepage" />

      <div className={styles.title}>
        <Title text={"Welcome to the ARC Services Portal"} centered description={description} />
        {isAuthed && (
          <HelperText className={styles["helper-text"]}>
            You can manage your certificates and view your roles in Profile.<br></br> To manage governance articles for
            your Studies, go to the Studies page.
          </HelperText>
        )}
      </div>

      <Notifications />
    </>
  );
}
