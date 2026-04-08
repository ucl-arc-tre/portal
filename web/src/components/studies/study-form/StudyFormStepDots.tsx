import styles from "./StudyFormStepDots.module.css";

type StudyFormStepDotsProps = {
  currentStep: number;
};

const totalSteps = 3;

export default function StudyFormStepDots({ currentStep }: StudyFormStepDotsProps) {
  return (
    <div className={styles["step-progress"]}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className={`${styles["step-dot"]} ${currentStep === i + 1 ? styles.active : ""}`}></div>
      ))}
    </div>
  );
}
