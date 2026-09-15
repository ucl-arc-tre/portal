import MetaHead from "@/components/meta/Head";
import Title from "@/components/ui/Title";
import styles from "./GlossaryPage.module.css";
import Callout from "@/components/ui/Callout";
import EntityGlossaryDefinition from "./glossaryDefinitions";
import { portalEntityDefinitions } from "@/components/shared/entityDefinitions";

export default function GlossaryPage() {
  return (
    <>
      <MetaHead
        title="Glossary | ARC Services Portal"
        description="Definitions and diagrams for terminology used in the ARC Services Portal"
      />

      <Callout construction />

      <Title
        text={"Glossary"}
        centered
        description={"Explore definitions for terms used in the ARC Services Portal, organised by category."}
      />

      <div className={styles["glossary-section"]}>
        <h2>Entities</h2>
        <div className={styles["entity-section"]}>
          <img
            src={"/entity_diagram.drawio.svg"}
            alt="Entity diagram demonstrating that studies are top level entities, with projects and assets as children. Projects can also contain assets"
            className={styles["entity-relationships"]}
          />
          <div className={styles["entity-definitions"]}>
            {Object.entries(portalEntityDefinitions).map(([word]) => (
              <EntityGlossaryDefinition key={word} word={word as keyof typeof portalEntityDefinitions} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
