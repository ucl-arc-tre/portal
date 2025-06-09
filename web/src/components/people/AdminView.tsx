import { getPeople, PeopleAdminResponse, PeopleApprovedResearcherResponse } from "@/openapi";
import { useEffect, useState } from "react";

type PersonAdminView = {
  User: {
    ID: string;
    CreatedAt: string;
    Username: string;
  };
  Agreements: [];
  Roles: string[];
};

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

  console.log("people", people);
  if (!people) return null;
  return (
    <table>
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
            <td>
              {person.User.Username} <small>{person.User.ID}</small>
            </td>
            <td>{person.Roles}</td>
            <td>{person.Agreements}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
