import { useState } from "react";
import ChosenNameChangeModal from "./ChosenNameChangeModal";
import styles from "./ProfileSummaryCard.module.css";
import EditIcon from "../ui/EditIcon";

type ProfileSummaryCardProps = {
  chosenName?: string;
  username?: string;
  roles?: string[];
};

export default function ProfileSummaryCard({ chosenName, username, roles }: ProfileSummaryCardProps) {
  const [showChosenNameChangeModal, setShowChosenNameChangeModal] = useState(false);
  return (
    <div className={styles["profile-summary-container"]}>
      <div className={styles.header}>
        <h2>Profile Information</h2>
      </div>

      <div className={styles.content}>
        <div className={styles.row}>
          <div className={styles.field}>
            <span className={styles.label}>Chosen name:</span>
            <span className={styles.value}>
              {chosenName || <span className={styles.placeholder}>Not set</span>}
              {chosenName && (
                <EditIcon onClick={() => setShowChosenNameChangeModal(true)} label="Request chosen name change" />
              )}
            </span>
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
                roles
                  .filter((role) => !role.includes("_")) // skip all object roles
                  .map((role) => (
                    <span key={role} className="role">
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

      <ChosenNameChangeModal
        isOpen={showChosenNameChangeModal}
        onClose={() => setShowChosenNameChangeModal(false)}
        currentChosenName={chosenName}
        username={username}
      />
    </div>
  );
}
