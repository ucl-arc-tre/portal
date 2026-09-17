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

const TREEntityDefinitions = {
  study: "Studies are the same",
  project: "Projects are the same",
  asset: "Assets are the same",
  contract: "Contracts are the same",
  environment: "Environments do not exist within the TRE, the TRE is the Environment",
};

export const roleDefinitions = {
  approved_researcher: {
    definition: "One who has provided sufficient certification of security training",
    label: "Approved Researcher",
  },
  approved_staff_researcher: {
    definition: "An Approved Researcher with UCL staff status",
    label: "Approved Staff Researcher",
  },
  iao: {
    definition:
      "An Approved Researcher who owns a Study and is responsible for the data within it. Also referenced as IAO",
    label: "Information Asset Owner",
  },
  iaa: {
    definition:
      "An Approved Researcher who is responsible for managing access to a Study and its data. Also referenced as IAA",
    label: "Information Asset Administrator",
  },
};

export default function EntityGlossaryDefinition({ word }: { word: keyof typeof portalEntityDefinitions }) {
  return (
    <Card title={word}>
      <em>{portalEntityDefinitions[word]}</em>
      <MenuDivider />
      <p>
        <strong>DSH:</strong> {DSHEntityDefinitions[word]}
      </p>
      <p>
        <strong>TRE:</strong> {TREEntityDefinitions[word]}
      </p>
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
