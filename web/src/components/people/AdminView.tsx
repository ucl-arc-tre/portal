import {
  ConfirmedAgreement,
  getPeople,
  PeopleAdminResponse,
  PeopleApprovedResearcherResponse,
  PersonAdminView,
} from "@/openapi";
import { useEffect, useState } from "react";
import styles from "./AdminView.module.css";
import dynamic from "next/dynamic";

// type Agreement = {
//   agreement_type: string;
//   confirmed_at: string;
// };
// type PersonAdminView = {
//   User: {
//     ID: string;
//     CreatedAt: string;
//     Username: string;
//   };
//   Agreements: Agreement[];
//   Roles: string[];
// };

const CheckIcon = dynamic(() => import("uikit-react-public").then((mod) => mod.Icon.Check), {
  ssr: false,
});
const XIcon = dynamic(() => import("uikit-react-public").then((mod) => mod.Icon.X), {
  ssr: false,
});

function isAdminResponse(data: PeopleAdminResponse | PeopleApprovedResearcherResponse): data is PeopleAdminResponse {
  return Array.isArray(data) && data.every((item) => "User" in item && "Agreements" in item);
}
export default function AdminView() {
  const [people, setPeople] = useState<PeopleAdminResponse | null>(null);

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const response = await getPeople();

        console.log(response);
        if (response.response.ok && response.data && isAdminResponse(response.data)) {
          setPeople(response.data);
        } else {
        }
      } catch (error) {
        console.error("Failed to get people:", error);
        setPeople(null);
      }
    };
    fetchPeople();
  }, []);

  if (!people) return null;

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>User</th>
          <th>Roles</th>
          <th>Agreements</th>
        </tr>
      </thead>
      <tbody>
        {people!.people.map((person: PersonAdminView) => (
          <tr key={person.user.id}>
            <td className={styles.user}>
              {person.user.username} <small>{person.user.id}</small>
            </td>
            <td className={styles.roles}>{person.roles}</td>
            <td className={styles.agreements}>
              {person.agreements.confirmed_agreements.map((agreement: ConfirmedAgreement) => (
                <div key={agreement.agreement_type}>
                  {agreement.agreement_type}
                  {agreement.confirmed_at ? <CheckIcon /> : <XIcon />}
                </div>
              ))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
