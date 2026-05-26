import styles from "./Box.module.css";

export default function Box({ children }: { children: React.ReactNode; warning?: boolean }) {
  return <div className={styles.container}>{children}</div>;
}
