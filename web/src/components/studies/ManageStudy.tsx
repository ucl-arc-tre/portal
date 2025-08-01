import { Study, Auth } from "@/openapi";
import styles from "./ManageStudy.module.css";

type ManageStudyProps = {
  study: Study;
  userData: Auth;
};

export default function ManageStudy({ study }: ManageStudyProps) {
  return (
    <div className={styles["manage-study"]}>
      <h2>Manage Study: {study.title}</h2>
      <p>Coming soon...</p>
    </div>
  );
}
