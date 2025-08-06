import styles from "./StepArrow.module.css";

type StepArrowProps = {
  text?: string;
};

export default function StepArrow({ text = "Complete the steps below" }: StepArrowProps) {
  return (
    <div className={styles["step-arrow"]}>
      <span className={styles["arrow-text"]}>{text}</span>
      <div className={styles["arrow-icon"]}>↓</div>
    </div>
  );
}
