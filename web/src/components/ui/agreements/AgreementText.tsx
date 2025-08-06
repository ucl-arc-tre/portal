import styles from "./AgreementText.module.css";
import Markdown from "react-markdown";

type Props = {
  text: string;
};

// a generic component to display different agreement texts
export default function AgreementText(props: Props) {
  return (
    <section className={styles["agreement-text-container"]}>
      <div className={styles["agreement-text-content"]}>
        <Markdown>{props.text}</Markdown>
      </div>
    </section>
  );
}
