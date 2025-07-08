import MetaHead from "@/components/meta/Head";
import Studies from "@/components/studies/Studies";
import Button from "@/components/ui/Button";
import Title from "@/components/ui/Title";
import styles from "./StudiesPage.module.css";
import { InfoIcon } from "@/components/assets/exports";

export default function StudiesPage() {
  return (
    <>
      <MetaHead
        title="Studies | ARC Services Portal"
        description="View and modify studies in the ARC Services Portal"
      />
      <Title text={"Studies"} />
      <p className={styles.subtitle}>
        <span className={styles.highlighted}>Studies</span> are a top level entity. They can contain{" "}
        <strong className={styles.coloured}>projects</strong>{" "}
        <InfoIcon title="Projects are owned by a study and can contain assets" className={styles.info} /> and{" "}
        <strong className={styles.coloured}>assets</strong>{" "}
        <InfoIcon
          title="Assets can be owned directly by a study or by a project within a study"
          className={styles.info}
        />
        , for more detailed information and an entity relationship diagram, look at our
        <Button href="/glossary" variant="tertiary" size="small" className={styles["glossary-button"]}>
          Glossary
        </Button>
      </p>

      <Studies />
    </>
  );
}
