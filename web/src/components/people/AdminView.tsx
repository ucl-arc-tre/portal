import { ConfirmedAgreement, getAllUsers, UserProfiles, UserProfile, TrainingRecord } from "@/openapi";
import { useEffect, useState } from "react";
import styles from "./AdminView.module.css";
import dynamic from "next/dynamic";
import Button from "../ui/Button";
import TrainingForm from "./TrainingForm";
import ApprovedResearcherImport from "./ApprovedResearcherImport";
import { TrainingKindOptions, XIcon } from "../assets/exports";
import Loading from "../ui/Loading";

const CheckIcon = dynamic(() => import("uikit-react-public").then((mod) => mod.Icon.Check), {
  ssr: false,
});

function convertRFC3339ToDDMMYYYY(dateString: string) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function getHumanReadableTrainingKind(trainingKind: string) {
  // getting the key from the value
  const humanReadableTrainingKind = Object.entries(TrainingKindOptions).find(
    ([, value]) => value === trainingKind
  )?.[0];

  return humanReadableTrainingKind;
}

export default function AdminView() {
  const [userProfiles, setUserProfiles] = useState<UserProfiles | null>(null);
  const [trainingDialogOpen, setTrainingDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [id, setId] = useState("");

  useEffect(() => {
    const fetchUserProfiles = async () => {
      setIsLoading(true);
      try {
        const response = await getAllUsers();
        if (response.response.ok && response.data) {
          setUserProfiles(response.data as UserProfiles);
        }
      } catch (error) {
        console.error("Failed to get user profiles:", error);
        setUserProfiles(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserProfiles();
  }, []);

  const updateUserProfileUI = (id: string, training: TrainingRecord) => {
    // get user profiles object and find the user profile with the right id then update the training
    if (!userProfiles) return;

    const updatedUserProfiles = [...userProfiles];
    const userProfileIndex = updatedUserProfiles.findIndex((userProfile) => userProfile.user.id === id);

    if (userProfileIndex !== -1) {
      const userProfile = updatedUserProfiles[userProfileIndex];
      userProfile.training_record.training_records ??= [];
      const recordIndex = userProfile.training_record.training_records.findIndex(
        (record: TrainingRecord) => record.kind === training.kind
      );

      // If the training record exists, remove it
      if (recordIndex !== -1) {
        userProfile.training_record.training_records.splice(recordIndex, 1);
      }

      userProfile.training_record.training_records.push(training);
      setUserProfiles(updatedUserProfiles);
    }
  };

  const handleEditTrainingClick = (id: string) => {
    setId(id);
    setTrainingDialogOpen(true);
  };

  if (!userProfiles) return null;

  if (isLoading) {
    return (
      <div className={styles.container}>
        <h2>Your Tasks</h2>
        <Loading message="Loading users..." />
      </div>
    );
  }
  return (
    <>
      {trainingDialogOpen && (
        <TrainingForm id={id} setTrainingDialogOpen={setTrainingDialogOpen} updateUserProfileUI={updateUserProfileUI} />
      )}

      <p>
        Please note the dates shown are when the agreement/training is <em>valid from</em>
      </p>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>User</th>
            <th>Roles</th>
            <th>Agreements</th>
            <th>Training</th>
          </tr>
        </thead>

        <tbody className={styles.tbody}>
          {userProfiles.map((userProfile: UserProfile) => (
            <tr key={userProfile.user.id} className={styles.row}>
              <td className={styles.user}>
                {userProfile.user.username} <small>{userProfile.user.id}</small>
              </td>

              <td className={styles.roles}>{userProfile.roles.join(", ")}</td>

              <td className={styles.agreements}>
                {userProfile.agreements.confirmed_agreements.map((agreement: ConfirmedAgreement) => (
                  <div key={agreement.agreement_type} className={styles.agreement}>
                    {agreement.agreement_type}
                    {agreement.confirmed_at && <small>{convertRFC3339ToDDMMYYYY(agreement.confirmed_at)}</small>}
                  </div>
                ))}
              </td>

              <td className={styles.trainingInfo} data-cy="training">
                <div className={styles.trainingRecord}>
                  {userProfile.training_record.training_records?.map((training: TrainingRecord) => (
                    <div
                      key={`${userProfile.user.id}-${training.kind}-${training.completed_at}`}
                      className={styles.training}
                    >
                      {getHumanReadableTrainingKind(training.kind)}
                      {training.is_valid ? (
                        <span className={styles.valid}>
                          <CheckIcon />
                        </span>
                      ) : (
                        <span className={styles.invalid}>
                          <XIcon />
                        </span>
                      )}
                      {training.completed_at && <small>{convertRFC3339ToDDMMYYYY(training.completed_at)}</small>}
                    </div>
                  ))}{" "}
                </div>

                <Button
                  variant="tertiary"
                  size="small"
                  onClick={() => handleEditTrainingClick(userProfile.user.id)}
                  className={styles.edit}
                >
                  Edit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ApprovedResearcherImport />
    </>
  );
}
