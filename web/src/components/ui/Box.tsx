import styles from "./Box.module.css";

export default function Box({
  children,
  isCard,
  warning,
}: {
  children: React.ReactNode;
  isCard?: boolean;
  warning?: boolean;
}) {
  return (
    <div className={`${styles.container} ${isCard ? styles.card : ""} ${warning ? styles.warning : ""}`}>
      {children}
    </div>
  );
}
