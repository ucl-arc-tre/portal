import Button from "../ui/Button";
import Callout from "../ui/Callout";
import InfoTooltip from "../ui/InfoTooltip";

const entityDefinitions = {
  study: "Studies are a top level entity that can contain Assets and Contracts and own Projects",
  project:
    "Projects are owned by a Study and can contain Assets and Contracts. They can be associated with an Environment",
  asset:
    "Assets are any kind of data or information entity (e.g. consent forms, physical study materials etc.). They are owned by a Study and can belong to a Project.",
  contract:
    "Contracts can be uploaded as PDFs and can be linked to Assets, Projects and Users. If you collaborate with an external researcher you must associate them with a contract",
  environment:
    "Environments are secure virtual spaces where data analysis can be performed. They can be associated with Projects. Presently, we support the TRE",
};

const EntityTooltip = ({ entity, isPlural }: { entity: keyof typeof entityDefinitions; isPlural?: boolean }) => {
  return (
    <>
      <strong>
        {entity.charAt(0).toUpperCase() + entity.slice(1)}
        {isPlural ? "s" : ""}
      </strong>
      <InfoTooltip text={entityDefinitions[entity]} />
    </>
  );
};

export const StudyDefinition = () => {
  return (
    <Callout definition>
      Studies are a top level entity that can contain <EntityTooltip entity="asset" isPlural /> and{" "}
      <EntityTooltip entity="contract" isPlural /> and own <EntityTooltip entity="project" isPlural />. For more
      detailed information and an entity relationship diagram, look at our
      <Button href="/glossary" variant="tertiary" size="small" inline>
        Glossary
      </Button>
    </Callout>
  );
};

export const AssetDefinition = () => {
  return (
    <Callout definition>
      Assets are any kind of data or information entity (e.g. consent forms, physical study materials etc.). They are
      owned by a <EntityTooltip entity="study" /> and can belong to a <EntityTooltip entity="project" />. For more
      detailed information and an entity relationship diagram, look at our
      <Button href="/glossary" variant="tertiary" size="small" inline>
        Glossary
      </Button>
    </Callout>
  );
};

export const ProjectDefinition = () => {
  return (
    <Callout definition>
      Projects are owned by a <EntityTooltip entity="study" /> and can contain <EntityTooltip entity="asset" isPlural />{" "}
      and <EntityTooltip entity="contract" isPlural />. They can be associated with an{" "}
      <EntityTooltip entity="environment" />
      For more detailed information and an entity relationship diagram, look at our
      <Button href="/glossary" variant="tertiary" size="small" inline>
        Glossary
      </Button>
    </Callout>
  );
};

export const ContractDefinition = () => {
  return (
    <Callout definition>
      Contracts can be uploaded as PDFs and can be linked to <EntityTooltip entity="asset" isPlural />,{" "}
      <EntityTooltip entity="project" isPlural /> and users. If you collaborate with an external researcher you must
      associate them with a contract. For more detailed information and an entity relationship diagram, look at our
      <Button href="/glossary" variant="tertiary" size="small" inline>
        Glossary
      </Button>
    </Callout>
  );
};
