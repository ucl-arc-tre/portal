import styles from "./Callout.module.css";

type CalloutProps = {
  text?: string;
  children?: React.ReactNode;
  construction?: boolean;
  definition?: boolean;
};
export default function Callout(CalloutProps: CalloutProps) {
  const { text, children, construction, definition } = CalloutProps;
  return (
    <div
      className={`${styles.callout} ${construction ? styles.construction : ""} ${definition ? styles.definition : ""}`}
    >
      {text && <p>{text}</p>}
      {construction && <p>This page is being built, check back soon for updates!</p>}
      {children}
    </div>
  );
}
