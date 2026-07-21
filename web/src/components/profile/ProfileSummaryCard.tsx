import { useState } from "react";
import ChosenNameChangeModal from "./ChosenNameChangeModal";
import styles from "./ProfileSummaryCard.module.css";
import EditIcon from "../ui/EditIcon";
import InfoTooltip from "../ui/InfoTooltip";
import { Profile as ProfileData } from "@/openapi";

type Props = {
  profileData?: ProfileData;
  username?: string;
  roles?: string[];
  callback: () => void;
};

export default function ProfileSummaryCard(props: Props) {
  const { profileData, username, roles, callback } = props;
  const [showChosenNameChangeModal, setShowChosenNameChangeModal] = useState(false);

  const chosenName = profileData?.chosen_name;
  const requestedChosenName = profileData?.requested_chosen_name;
  const chosenNamePendingApproval =
    requestedChosenName && profileData?.requested_chosen_name !== profileData?.chosen_name;

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
              {chosenName ? (
                chosenNamePendingApproval ? (
                  <>
                    {requestedChosenName}
                    <InfoTooltip text="Name change pending approval" />
                  </>
                ) : (
                  <>
                    {chosenName}
                    <EditIcon
                      onClick={() => setShowChosenNameChangeModal(true)}
                      label="Request chosen name change"
                      cy="edit-chosen-name"
                    />
                  </>
                )
              ) : (
                <span className={styles.placeholder}>Not set</span>
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
        setOpen={setShowChosenNameChangeModal}
        onSuccess={() => {
          setShowChosenNameChangeModal(false);
          callback();
        }}
        currentChosenName={chosenName}
        username={username}
      />
    </div>
  );
}
