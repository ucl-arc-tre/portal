import { Study } from "@/openapi";
import Button from "../../ui/Button";
import styles from "./StudyFormNavigation.module.css";

const totalSteps = 3;

type StudyFormNavigationProps = {
  currentStep: number;
  isSubmitting: boolean;
  editingStudy?: Study | null;
  onPrev: () => void;
  onNext: () => void;
};

export default function StudyFormNavigation({
  currentStep,
  isSubmitting,
  editingStudy,
  onPrev,
  onNext,
}: StudyFormNavigationProps) {
  return (
    <>
      <div className={styles["buttons-container"]}>
        {currentStep > 1 && (
          <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={onPrev}
            className={styles["button--back"]}
            cy="back"
          >
            &larr; Back
          </Button>
        )}

        {currentStep < totalSteps && (
          <Button type="button" size="small" onClick={onNext} className={styles["button--continue"]} cy="next">
            Next &rarr;
          </Button>
        )}
      </div>

      {currentStep === totalSteps && (
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting study..." : editingStudy ? "Update Study" : "Create Study"}
        </Button>
      )}
    </>
  );
}
