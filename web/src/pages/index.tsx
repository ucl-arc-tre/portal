import styles from "./index.module.css";
import MetaHead from "@/components/meta/Head";
import UserTasks from "@/components/index/UserTasks";

export default function Index() {
  return (
    <>
      <MetaHead title="ARC Services Portal | UCL" description="ARC Services Portal homepage" />
      <div className={styles.title}>
        <h1>Welcome to the ARC Services Portal</h1>
        <p>This portal allows UCL researchers to manage ARC services and tasks.</p>
      </div>
      <UserTasks />
    </>
  );
}
