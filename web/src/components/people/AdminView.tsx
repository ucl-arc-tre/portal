import { ConfirmedAgreement, getPeople, People, Person } from "@/openapi";
import { useEffect, useState } from "react";
import styles from "./AdminView.module.css";
import dynamic from "next/dynamic";
import Button from "../ui/Button";
import UsernameForm from "./UsernameForm";
import AgreementsForm from "./AgreementsForm";

const CheckIcon = dynamic(() => import("uikit-react-public").then((mod) => mod.Icon.Check), {
  ssr: false,
});
export const XIcon = dynamic(() => import("uikit-react-public").then((mod) => mod.Icon.X), {
  ssr: false,
});

function convertRFC3339ToDDMMYYYY(dateString: string) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // January is 0!
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export default function AdminView() {
  const [people, setPeople] = useState<People | null>(null);
  const [userNameDialogOpen, setUsernameDialogOpen] = useState(false);
  const [agreementsDialogOpen, setAgreementsDialogOpen] = useState(false);

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

  if (!people) return null;

  const handleEditUsernameClick = (id: string) => {
    setId(id);
    setUsernameDialogOpen(true);
  };
  const handleEditAgreementsClick = (id: string) => {
    setId(id);
    setAgreementsDialogOpen(true);
  };

  return (
    <>
      {userNameDialogOpen && <UsernameForm id={id} setUsernameDialogOpen={setUsernameDialogOpen} />}
      {agreementsDialogOpen && <AgreementsForm id={id} setAgreementsDialogOpen={setAgreementsDialogOpen} />}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>User</th>
            <th>Roles</th>
            <th>Agreements</th>
          </tr>
        </thead>
        <tbody>
          {people.map((person: Person) => (
            <tr key={person.user.id}>
              <td className={styles.user}>
                <span>
                  {person.user.username}{" "}
                  <Button
                    variant="tertiary"
                    size="small"
                    onClick={() => handleEditUsernameClick(person.user.id)}
                    className={styles.edit}
                  >
                    Edit
                  </Button>
                </span>
                <small>{person.user.id}</small>
              </td>
              <td className={styles.roles}>{person.roles.join(", ")}</td>
              <td className={styles.agreements}>
                {person.agreements.confirmed_agreements.map((agreement: ConfirmedAgreement) => (
                  <div key={agreement.agreement_type} className={styles.agreement}>
                    {agreement.agreement_type}
                    {agreement.confirmed_at ? (
                      <span className={styles.confirmed}>
                        <CheckIcon />
                      </span>
                    ) : (
                      <span className={styles.unconfirmed}>
                        <XIcon />
                      </span>
                    )}
                    {agreement.confirmed_at && <small>{convertRFC3339ToDDMMYYYY(agreement.confirmed_at)}</small>}
                  </div>
                ))}{" "}
                <Button
                  variant="tertiary"
                  size="small"
                  onClick={() => handleEditAgreementsClick(person.user.id)}
                  className={styles.edit}
                >
                  Edit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
