import Button from "../ui/Button";
import styles from "./ProfileStepProgress.module.css";
import dynamic from "next/dynamic";

const CheckIcon = dynamic(() => import("uikit-react-public").then((mod) => mod.Icon.Check), {
  ssr: false,
});

type ProfileStepProgressProps = {
  steps: ProfileStep[];
  profileIsComplete?: boolean;
};

export default function ProfileStepProgress(props: ProfileStepProgressProps) {
  const { steps, profileIsComplete } = props;

  return (
    <div className={styles.container}>
      <div className={styles["completion-header"]}>
        {profileIsComplete ? (
          <>
            <h3 className={styles["completion-title"]}>Profile Complete!</h3>
            <p className={styles["completion-subtitle"]}>
              You have successfully completed all profile setup steps and are now an approved researcher. You can now
              create and manage studies.
            </p>
            <Button href="/studies" size="default">
              Go to studies
            </Button>
          </>
        ) : (
          <p className={styles["intro-text"]}>
            Complete the following steps to set up your profile and become an approved researcher.
          </p>
        )}
      </div>

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
