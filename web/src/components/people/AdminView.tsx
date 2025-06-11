import { getPeople, PeopleAdminResponse, PeopleApprovedResearcherResponse } from "@/openapi";
import { useEffect, useState } from "react";
import styles from "./AdminView.module.css";
import dynamic from "next/dynamic";

type Agreement = {
  agreement_type: string;
  confirmed_at: string;
};
type PersonAdminView = {
  User: {
    ID: string;
    CreatedAt: string;
    Username: string;
  };
  Agreements: Agreement[];
  Roles: string[];
};

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
        {people!.map((person: PersonAdminView) => (
          <tr key={person.User.ID}>
            <td className={styles.user}>
              {person.User.Username} <small>{person.User.ID}</small>
            </td>
            <td className={styles.roles}>{person.Roles}</td>
            <td className={styles.agreements}>
              {Object.entries(person.Agreements).map(([key, agreement]) => (
                <div key={key}>
                  {agreement!.agreement_type}
                  {agreement!.confirmed_at! ? <CheckIcon /> : <XIcon />}
                </div>
              ))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
