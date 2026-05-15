import InfoTooltip from "../ui/InfoTooltip";

export const entityDefinitions = {
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

export const EntityTooltip = ({ entity, isPlural }: { entity: keyof typeof entityDefinitions; isPlural?: boolean }) => {
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
