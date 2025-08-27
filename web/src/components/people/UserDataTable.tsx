import { ConfirmedAgreement, TrainingRecord, UserData } from "@/openapi";
import { CheckIcon, convertRFC3339ToDDMMYYYY, getHumanReadableTrainingKind, XIcon } from "../shared/exports";
import Loading from "../ui/Loading";
import Button from "../ui/Button";

import styles from "./UserDataTable.module.css";
import { useState } from "react";
import TrainingForm from "./TrainingForm";

type Props = {
  canEdit: boolean;
  users: Array<UserData>;
  setUsers: (users: Array<UserData>) => void;
  isLoading: boolean;
};
export default function UserDataTable(Props: Props) {
  const { canEdit, users, setUsers, isLoading } = Props;
  const [trainingDialogOpen, setTrainingDialogOpen] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState("");

  const updateTrainingDateCell = (id: string, training: TrainingRecord) => {
    // get people object and find the person with the right selectedUserId then update the training
    if (!users) return;

    const updatedPeople = [...users];
    const personIndex = updatedPeople.findIndex((person) => person.user.id === selectedUserId);

    if (personIndex !== -1) {
      const person = updatedPeople[personIndex];
      person.training_record.training_records ??= [];
      const recordIndex = person.training_record.training_records.findIndex((record) => record.kind === training.kind);

      // If the training record exists, remove it
      if (recordIndex !== -1) {
        person.training_record.training_records.splice(recordIndex, 1);
      }

      person.training_record.training_records.push(training);
      setUsers(updatedPeople);
    }
  };
  const handleEditTrainingClick = (selectedUserId: string) => {
    setSelectedUserId(selectedUserId);
    setTrainingDialogOpen(true);
  };

  if (!users) return <div className={styles.container}>No users found</div>;

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Loading message="Loading users..." />
      </div>
    );
  }

  return (
    <>
      {trainingDialogOpen && (
        <TrainingForm
          userId={selectedUserId}
          setTrainingDialogOpen={setTrainingDialogOpen}
          updateTrainingDateCell={updateTrainingDateCell}
        />
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
          {users.map((userData: UserData) => (
            <tr key={userData.user.id} className={styles.row}>
              <td className={styles.user}>
                {userData.user.username} <small>{userData.user.id}</small>
              </td>
              <td className={styles.roles}>
                {userData.roles.map((role) => (
                  <span key={role} className="role">
                    {role}
                  </span>
                ))}
              </td>
              <td className={styles.agreements}>
                {userData.agreements.confirmed_agreements.map((agreement: ConfirmedAgreement) => (
                  <div key={agreement.agreement_type} className={styles.agreement}>
                    {agreement.agreement_type}
                    {agreement.confirmed_at && <small>{convertRFC3339ToDDMMYYYY(agreement.confirmed_at)}</small>}
                  </div>
                ))}
              </td>
              <td className={styles.trainingInfo} data-cy="training">
                <div className={styles.trainingRecord}>
                  {userData.training_record.training_records?.map((training: TrainingRecord) => (
                    <div
                      key={`${userData.user.id}-${training.kind}-${training.completed_at}`}
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
                {canEdit && (
                  <Button
                    variant="tertiary"
                    size="small"
                    onClick={() => handleEditTrainingClick(userData.user.id)}
                    className={styles.edit}
                  >
                    Edit
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
