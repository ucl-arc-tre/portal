import MetaHead from "@/components/meta/Head";
import Title from "@/components/ui/Title";
import styles from "./GlossaryPage.module.css";
import Callout from "@/components/ui/Callout";
import EntityGlossaryDefinition, { roleDefinitions, RoleGlossaryDefinition } from "./glossaryDefinitions";
import { portalEntityDefinitions } from "@/components/shared/entityDefinitions";
import TabCollection from "@/components/ui/TabCollection";
import { useRouter } from "next/router";
import { HelperText } from "@/components/ui/uikitExports";

export default function GlossaryPage() {
  const router = useRouter();
  const tab = (router.query.tab as "entities" | "roles") ?? "entities";
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

      <TabCollection tabs={[{ name: "entities" }, { name: "roles" }]} defaultTab="entities" />

      {tab === "entities" && (
        <div className={styles["glossary-section"]}>
          <HelperText>
            We have provided a diagram to help visualise the relationships between entities found on The Portal. Below
            that are cards with definitions which also explain the differences on supported services.
          </HelperText>
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
      )}

      {tab === "roles" && (
        <div className={styles["glossary-section"]}>
          {Object.entries(roleDefinitions).map(([word]) => (
            <RoleGlossaryDefinition key={word} word={word as keyof typeof roleDefinitions} />
          ))}
        </div>
      )}
    </>
  );
}
