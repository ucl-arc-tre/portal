import styles from "./AgreementText.module.css";
import Markdown from "react-markdown";

type AgreementTextProps = {
  text: string;
};

export default function AgreementText(props: AgreementTextProps) {
  return (
    <section className={styles.text} data-cy="approved-researcher-agreement-text">
      <div className={styles.wrapper}>
        <Markdown>{props.text}</Markdown>
      </div>
    </section>
  );
}
