import { ConfirmedAgreement, getPeople, People, Person, TrainingRecord } from "@/openapi";
import { useEffect, useState } from "react";
import styles from "./AdminView.module.css";
import dynamic from "next/dynamic";
import Button from "../ui/Button";
import TrainingForm from "./TrainingForm";
import ApprovedResearcherImport from "./ApprovedResearcherImport";

const CheckIcon = dynamic(() => import("uikit-react-public").then((mod) => mod.Icon.Check), {
  ssr: false,
});
export const XIcon = dynamic(() => import("uikit-react-public").then((mod) => mod.Icon.X), {
  ssr: false,
});

function convertRFC3339ToDDMMYYYY(dateString: string) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export default function AdminView() {
  const [people, setPeople] = useState<People | null>(null);
  const [trainingDialogOpen, setTrainingDialogOpen] = useState(false);

  const [id, setId] = useState("");

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const response = await getPeople();

        if (response.response.ok && response.data) {
          setPeople(response.data as People);
        }
      } catch (error) {
        console.error("Failed to get people:", error);
        setPeople(null);
      }
    };
    fetchPeople();
  }, []);

  const updatePersonUI = (id: string, training?: TrainingRecord) => {
    // get people object and find the person with the right id
    const personToUpdate = people!.find((person) => person.user.id === id);

    if (personToUpdate) {
      if (training) {
        if (!personToUpdate.training_record) {
          personToUpdate.training_record = [];
        }
        personToUpdate.training_record.push(training);
      }
    }
  };

  if (!people) return null;

  const handleEditTrainingClick = (id: string) => {
    setId(id);
    setTrainingDialogOpen(true);
  };

  return (
    <>
      {trainingDialogOpen && (
        <TrainingForm id={id} setTrainingDialogOpen={setTrainingDialogOpen} updatePersonUI={updatePersonUI} />
      )}

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
          {people.map((person: Person) => (
            <tr key={person.user.id}>
              <td className={styles.user}>
                {person.user.username} <small>{person.user.id}</small>
              </td>
              <td className={styles.roles}>{person.roles.join(", ")}</td>
              <td className={styles.agreements}>
                {person.agreements.confirmed_agreements.map((agreement: ConfirmedAgreement) => (
                  <div key={agreement.agreement_type} className={styles.agreement}>
                    {agreement.agreement_type}
                    {agreement.confirmed_at ? (
                      <span className={styles.valid}>
                        <CheckIcon />
                      </span>
                    ) : (
                      <span className={styles.invalid}>
                        <XIcon />
                      </span>
                    )}
                    {agreement.confirmed_at && <small>{convertRFC3339ToDDMMYYYY(agreement.confirmed_at)}</small>}
                  </div>
                ))}
              </td>
              <td>
                <div className={styles.trainingRecord} data-cy="training">
                  {person.training_record?.map((training: TrainingRecord) => (
                    <div key={training.kind} className={styles.training}>
                      {training.kind}
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
                  <Button
                    variant="tertiary"
                    size="small"
                    onClick={() => handleEditTrainingClick(person.user.id)}
                    className={styles.edit}
                  >
                    Edit
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ApprovedResearcherImport />
    </>
  );
}
