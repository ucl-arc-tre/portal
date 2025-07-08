import MetaHead from "@/components/meta/Head";
import Title from "@/components/ui/Title";
import styles from "./GlossaryPage.module.css";

export default function GlossaryPage() {
  return (
    <>
      <MetaHead
        title="Glossary | ARC Services Portal"
        description="Definitions and diagrams for terminology used in the ARC Services Portal"
      />
      <Title text={"Glossary"} />
      <p>
        This page is being built. Please check back soon for updates! Below is a basic diagram of how our entities are
        related
      </p>

      <img
        src={"/entity_relationships.png"}
        alt="Entity diagram demonstrating that studies are top level entities, with projects and assets as children. Projects can also contain assets"
        className={styles["entity-relationships"]}
      />
    </>
  );
}
