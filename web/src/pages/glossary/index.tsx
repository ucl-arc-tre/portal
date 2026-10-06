import MetaHead from "@/components/meta/Head";
import PageHeader from "@/components/ui/PageHeader";
import { HelperText } from "@/components/ui/uikitExports";
import styles from "./GlossaryPage.module.css";
import EntityGlossaryDefinition, { roleDefinitions, RoleGlossaryDefinition } from "./glossaryDefinitions";
import { portalEntityDefinitions } from "@/components/shared/entityDefinitions";
import TabCollection from "@/components/ui/TabCollection";
import { useRouter } from "next/router";

export default function GlossaryPage() {
  const router = useRouter();
  const tab = (router.query.tab as "entities" | "roles") ?? "entities";
  return (
    <div className={styles.container}>
      <MetaHead
        title="Glossary | ARC Services Portal"
        description="Definitions and diagrams for terminology used in the ARC Services Portal"
      />

      <PageHeader title="Glossary" />
      <HelperText>Explore definitions for terms used in the ARC Services Portal, organised by category.</HelperText>

      <TabCollection tabs={[{ name: "entities" }, { name: "roles" }]} defaultTab="entities" />

      {tab === "entities" && (
        <div>
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
        <div>
          {Object.entries(roleDefinitions).map(([word]) => (
            <RoleGlossaryDefinition key={word} word={word as keyof typeof roleDefinitions} />
          ))}
        </div>
      )}
    </div>
  );
}
