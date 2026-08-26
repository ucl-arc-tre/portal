import styles from "./AgreementText.module.css";
import Markdown from "react-markdown";
import { AnchorHTMLAttributes } from "react";

type Props = {
  text: string;
};

// Override default Markdown anchor rendering to open links in a new tab
function NewTabLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a {...props} target="_blank" rel="noopener noreferrer" />;
}

// a generic component to display different agreement texts
export default function AgreementText(props: Props) {
  return (
    <section className={styles["agreement-text-container"]}>
      <div className={styles["agreement-text-content"]}>
        <Markdown components={{ a: NewTabLink }}>{props.text}</Markdown>
      </div>
    </section>
  );
}
