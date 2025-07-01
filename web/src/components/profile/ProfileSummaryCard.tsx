import styles from "./ProfileSummaryCard.module.css";

type ProfileSummaryCardProps = {
  chosenName?: string;
  username?: string;
  roles?: string[];
};

export default function ProfileSummaryCard({ chosenName, username, roles }: ProfileSummaryCardProps) {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Profile Information</h3>
      <div className={styles.content}>
        <div className={styles.row}>
          <div className={styles.field}>
            <span className={styles.label}>Chosen name:</span>
            <span className={styles.value}>{chosenName || <span className={styles.placeholder}>Not set</span>}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Username:</span>
            <span className={styles.value}>{username}</span>
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.field}>
            <span className={styles.label}>Roles:</span>
            <div className={styles.roles}>
              {roles && roles.length > 0 ? (
                roles.map((role) => (
                  <span key={role} className={styles.role}>
                    {role}
                  </span>
                ))
              ) : (
                <span className={styles.placeholder}>No roles assigned</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
