import styles from "./Badge.module.css";

type BadgeProps = {
  children: React.ReactNode;
  cy: string;
  className: string;
};

export default function Badge({ children, cy, className }: BadgeProps) {
  return (
    <span className={`${className} ${styles["badge"]}`} data-cy={cy}>
      {children}
    </span>
  );
}
