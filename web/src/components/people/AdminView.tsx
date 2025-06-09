import { getPeople } from "@/openapi";
import { useEffect, useState } from "react";

export default function AdminView() {
  const [people, setPeople] = useState([]);
  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const response = await getPeople();

        console.log(response);
        // if (response.response.ok && response.data?) {
        // setPeople(response.data)} else {
        // }
      } catch (error) {
        console.error("Failed to get people:", error);
        setPeople([]);
      }
    };
    fetchPeople();
  }, []);
  return (
    <table>
      <thead></thead>
      <tbody>
        {people.map((person) => (
          <tr key={person}>
            <td>{person}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
