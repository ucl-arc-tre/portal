import styles from "./ProfileStepProgress.module.css";
import dynamic from "next/dynamic";

const CheckIcon = dynamic(() => import("uikit-react-public").then((mod) => mod.Icon.Check), {
  ssr: false,
});

type ProfileStepProgressProps = {
  steps: ProfileStep[];
};

export default function ProfileStepProgress(props: ProfileStepProgressProps) {
  const { steps } = props;

  return (
    <div className={styles.container}>
      <div aria-label="Profile setup progress">
        <ol className={styles["step-list"]}>
          {steps.map((step, stepIndex) => (
            <li key={step.id} className={styles.step}>
              <div className={styles["step-content"]}>
                <div
                  className={`${styles["step-icon"]} ${
                    step.completed
                      ? styles["step-icon-completed"]
                      : step.current
                        ? styles["step-icon-current"]
                        : styles["step-icon-pending"]
                  }`}
                >
                  {step.completed ? (
                    <CheckIcon className={styles["check-icon"]} />
                  ) : (
                    <span className={styles["step-number"]}>{stepIndex + 1}</span>
                  )}
                </div>

                <div className={styles["step-details"]}>
                  <h3
                    className={`${styles["step-title"]} ${
                      step.completed
                        ? styles["step-title-completed"]
                        : step.current
                          ? styles["step-title-current"]
                          : styles["step-title-pending"]
                    }`}
                  >
                    {step.title}
                  </h3>

                  <p
                    className={`${styles["step-description"]} ${
                      step.completed
                        ? styles["step-description-completed"]
                        : step.current
                          ? styles["step-description-current"]
                          : styles["step-description-pending"]
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
              {stepIndex < steps.length - 1 && (
                <div
                  className={`${styles["step-connector"]} ${
                    step.completed ? styles["step-connector-completed"] : styles["step-connector-pending"]
                  }`}
                />
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
