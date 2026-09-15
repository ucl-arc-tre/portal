// write definitions for each entity, use the ones we already have as the portal ones
// mention something about TRE uses the same nomenclature
// new dict for DSH, do each env with the same structure as portal and only have what's relevant
// each card has  the term with the definition and then a divider for the other env definitions

import Card from "@/components/ui/Card";
import { portalEntityDefinitions } from "../../components/shared/entityDefinitions";
import { MenuDivider } from "@/components/nav/Nav";

const DSHEntityDefinitions = {
  study: "Studies are the same",
  project: "Projects are known as Shares",
  asset: "Assets are the same",
  contract: "Contracts are the same",
  environment: "Environments do not exist within the DSH, the DSH is the Environment",
};

const roleDefinitions = {
  approved_researcher: "An Approved Researcher is one who has provided sufficient ceertification of security training",
  approved_staff_researcher: "An Approved Staff Researcher is an Approved Researcher with UCL staff status",
  iao: "An Information Asset Owner (IAO) is an Approved Researcher who owns a Study and is responsible for the data within it",
  iaa: "An Information Asset Administrator (IAA) is an Approved Researcher who is responsible for managing access to a Study and its data",
};

export default function EntityGlossaryDefinition({ word }: { word: keyof typeof portalEntityDefinitions }) {
  return (
    <Card title={word}>
      <em>{portalEntityDefinitions[word]}</em>
      <MenuDivider />
      <p>
        <strong>In DSH:</strong> {DSHEntityDefinitions[word]}
      </p>
    </Card>
  );
}

export function RoleGlossaryDefinition({ word }: { word: keyof typeof roleDefinitions }) {
  return (
    <Card title={word}>
      <em>{roleDefinitions[word]}</em>
    </Card>
  );
}
