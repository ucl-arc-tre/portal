import styles from "./index.module.css";
import MetaHead from "@/components/meta/Head";
import Notifications from "@/components/index/Notifications";
import Title from "@/components/ui/Title";

const description = `Use the ARC Services Portal to manage Studies, Study teams, governance records and access to UCL Research Data Services.
`;

export default function Index() {
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
