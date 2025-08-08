import { CheckIcon } from "@/components/shared/exports";
import Button from "../Button";
import styles from "./StepProgress.module.css";
import dynamic from "next/dynamic";

export const AlertTriangleIcon = dynamic(() => import("uikit-react-public").then((mod) => mod.Icon.AlertTriangle), {
  ssr: false,
});

export default function StepProgress(props: StepProgressProps) {
  const {
    steps,
    isComplete = false,
    completionTitle = "Complete!",
    completionSubtitle = "You have successfully completed all steps.",
    completionButtonText,
    completionButtonHref,
    introText = "Complete the following steps.",
    ariaLabel = "Progress steps",
    expiryUrgency,
  } = props;

  const getTitleClasses = (step: Step) => {
    if (!step.expiryUrgency) {
      return step.completed
        ? styles["step-title-completed"]
        : step.current
          ? styles["step-title-current"]
          : styles["step-title-pending"];
    } else if (step.expiryUrgency.level == "low") {
      return styles["step-title-completed"];
    } else if (step.expiryUrgency.level == "medium") {
      return styles["step-title-expiry-urgency-medium"];
    } else if (step.expiryUrgency.level == "high") {
      return styles["step-title-pending"];
    }
  };

  return (
    <div className={styles["step-progress-container"]}>
      <div className={styles["completion-header"]}>
        {expiryUrgency ? (
          <>
            <h3
              className={
                expiryUrgency?.level == "medium"
                  ? styles["expiring-title-urgency-medium"]
                  : expiryUrgency?.level == "high"
                    ? styles["expiring-title-urgency-high"]
                    : styles["completion-title"]
              }
            >
              Your certificate is expiring soon!
            </h3>
            <p className={styles["completion-subtitle"]}>
              To retain access to the portal, please upload a new certificate.
            </p>
          </>
        ) : isComplete ? (
          <>
            <h3 className={styles["completion-title"]}>{completionTitle}</h3>
            <p className={styles["completion-subtitle"]}>{completionSubtitle}</p>
            {completionButtonText && completionButtonHref && (
              <Button href={completionButtonHref} size="default">
                {completionButtonText}
              </Button>
            )}
          </>
        ) : (
          <p className={styles["intro-text"]}>{introText}</p>
        )}
      </div>
      {/* todo: add expiring styling */}

      <div aria-label={ariaLabel}>
        <ol className={styles["step-list"]}>
          {steps.map((step, stepIndex) => (
            <li key={step.id} className={styles.step}>
              <div className={styles["step-content"]}>
                <div
                  className={`${styles["step-icon"]} ${
                    step.expiryUrgency?.level == "medium"
                      ? styles["step-icon-expiry-urgency-medium"]
                      : step.expiryUrgency?.level == "high"
                        ? styles["step-icon-pending"]
                        : step.completed
                          ? styles["step-icon-completed"]
                          : step.current
                            ? styles["step-icon-current"]
                            : styles["step-icon-pending"]
                  }`}
                >
                  {step.expiryUrgency?.level == "medium" || step.expiryUrgency?.level == "high" ? (
                    <AlertTriangleIcon className={styles["alert-triangle-icon"]} />
                  ) : step.completed ? (
                    <CheckIcon className={styles["check-icon"]} />
                  ) : (
                    <span className={styles["step-number"]}>{stepIndex + 1}</span>
                  )}
                </div>

                <div className={styles["step-details"]}>
                  <h3 className={` ${styles["step-title"]} ${getTitleClasses(step)}`}>{step.title}</h3>

                  <p
                    className={`${styles["step-description"]} ${
                      step.expiryUrgency
                        ? styles["step-description-pending"]
                        : step.completed
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
                    step.expiryUrgency
                      ? styles["step-connector-pending"]
                      : step.completed
                        ? styles["step-connector-completed"]
                        : styles["step-connector-pending"]
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
