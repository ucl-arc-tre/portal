import { useState } from "react";
import ChosenNameChangeModal from "./ChosenNameChangeModal";
import styles from "./ProfileSummaryCard.module.css";
import EditIcon from "../ui/EditIcon";
import InfoTooltip from "../ui/InfoTooltip";
import { Profile as ProfileData } from "@/openapi";
import HelperBlock from "../ui/HelperBlock";

const helperText = `View and manage your profile information, including your name, email address, and role within the project. You can also view and upload your training certificate and view its expiry date to ensure your training records remain current and up to date.

All members of UCL including external collaborators who manage highly confidential research information must undertake annual NHS Data Security & Awareness training on handling sensitive information. Anyone with an '.ac.uk' or NHS email address can self-register for NHS Digital Data Security Awareness Level 1 course provided by e-Learning for Health. When prompted, select "Further Education and Higher Education Researcher (Education)" as your role to gain access to the course. Information Governance training completed through UCLH and another university is also accepted. Please contact the Information Governance Advisory Service for further information (email – infogov@ucl.ac.uk ).

To upload a new training certificate, select Verify Another Certificate, choose the relevant certificate, and then select Submit.
`;

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

      <HelperBlock text={helperText} />

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
