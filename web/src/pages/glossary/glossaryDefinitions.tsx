import Card from "@/components/ui/Card";
import { portalEntityDefinitions } from "../../components/shared/entityDefinitions";
import { MenuDivider } from "@/components/ui/uikitExports";

const DSHEntityDefinitions = {
  project: "Projects are known as Shares",
};

export const roleDefinitions = {
  approved_researcher: {
    definition: "A user who has provided sufficient certification of security training",
    label: "Approved Researcher",
  },
  approved_staff_researcher: {
    definition: "An Approved Researcher with UCL staff status",
    label: "Approved Staff Researcher",
  },
  iao: {
    definition:
      "An Approved Researcher who owns a Study and is responsible for the data within it. They are responsible for ensuring that confidential information associated with the study is managed securely and in accordance with UCL information governance policies.",
    label: "Information Asset Owner (IAO)",
  },
  iaa: {
    definition:
      "An Approved Researcher who is responsible for managing access to a Study and its data. They are appointed by the IAO to manage the day-to-day handling of information within a study.",
    label: "Information Asset Administrator (IAA)",
  },
};

export default function EntityGlossaryDefinition({ word }: { word: keyof typeof portalEntityDefinitions }) {
  return (
    <Card title={word}>
      <em>{portalEntityDefinitions[word]}</em>

      {DSHEntityDefinitions[word as keyof typeof DSHEntityDefinitions] ? (
        <>
          <MenuDivider />
          <p>
            <strong>DSH:</strong> {DSHEntityDefinitions[word as keyof typeof DSHEntityDefinitions]}
          </p>
        </>
      ) : (
        ""
      )}
    </Card>
  );
}

export function RoleGlossaryDefinition({ word }: { word: keyof typeof roleDefinitions }) {
  return (
    <Card title={roleDefinitions[word].label}>
      <em>{roleDefinitions[word].definition}</em>
    </Card>
  );
}
