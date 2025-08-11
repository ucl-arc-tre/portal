import styles from "./index.module.css";
import MetaHead from "@/components/meta/Head";
import UserTasks from "@/components/index/UserTasks";
import Title from "@/components/ui/Title";

export default function Index() {
  return (
    <>
      <MetaHead title="ARC Services Portal | UCL" description="ARC Services Portal homepage" />

      <div className={styles.title}>
        <Title text={"Welcome to the ARC Services Portal"} />
        <p>This portal allows UCL researchers to manage ARC services and tasks.</p>
      </div>

      <div className={styles["task-wrapper"]}>
        <UserTasks />
      </div>
    </>
  );
}
