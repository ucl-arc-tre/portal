import styles from "./index.module.css";
import MetaHead from "@/components/meta/Head";
import Notifications from "@/components/index/Notifications";
import Title from "@/components/ui/Title";
import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const { isAuthed } = useAuth();

  let description = `Use the ARC Services Portal to manage Studies, Study teams, governance records and access to UCL Research Data services.`;

  if (isAuthed) {
    description += `\n\n You can manage your certificates and view your roles in Profile.\n To manage governance articles for your Studies, go to the Studies page.`;
  }

  return (
    <>
      <MetaHead title="ARC Services Portal | UCL" description="ARC Services Portal homepage" />

      <div className={styles.title}>
        <Title text={"Welcome to the ARC Services Portal"} centered description={description} />
      </div>

      <Notifications />
    </>
  );
}
