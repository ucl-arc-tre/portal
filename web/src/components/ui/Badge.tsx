import styles from "./Badge.module.css";

type BadgeProps = {
  children: React.ReactNode;
  suffix?: React.ReactNode;
  cy: string;
  className: string;
};

export default function Badge({ children, suffix, cy, className }: BadgeProps) {
  return (
    <span className={`${className} ${styles["badge"]}`} data-cy={cy}>
      <span className={styles.label}>{children}</span>
      {suffix && <span className={styles.suffix}>{suffix}</span>}
    </span>
  );
}
