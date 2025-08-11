import MetaHead from "@/components/meta/Head";
import Title from "@/components/ui/Title";
import styles from "./GlossaryPage.module.css";
import Callout from "@/components/ui/Callout";

export default function GlossaryPage() {
  return (
    <>
      <MetaHead
        title="Glossary | ARC Services Portal"
        description="Definitions and diagrams for terminology used in the ARC Services Portal"
      />
      <Title text={"Glossary"} centered description={" Below is a basic diagram of how our entities are related"} />
      <Callout construction />

      <img
        src={"/entity_diagram.drawio.svg"}
        alt="Entity diagram demonstrating that studies are top level entities, with projects and assets as children. Projects can also contain assets"
        className={styles["entity-relationships"]}
      />
    </>
  );
}
