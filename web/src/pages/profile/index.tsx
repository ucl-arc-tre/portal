import MetaHead from "@/components/meta/Head";
import Profile from "@/components/profile/Profile";
import styles from "./ProfilePage.module.css";

export default function ProfilePage() {
  return (
    <>
      <MetaHead
        title="User Profile | ARC Services Portal"
        description="View and manage your ARC profile and researcher status"
      />
      <div className={styles.page}>
        <h1 className={styles.title}>Profile</h1>
        <Profile />
      </div>
    </>
  );
}
