import styles from "./Box.module.css";

export default function Box({ children, isCard }: { children: React.ReactNode; isCard?: boolean }) {
  return <div className={`${styles.container} ${isCard ? styles.card : ""}`}>{children}</div>;
}
