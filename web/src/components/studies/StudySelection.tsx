import Button from "@/components/ui/Button";
import styles from "./StudySelection.module.css";

type StudySelectionProps = {
  studies: Study[];
  handleStudySelect: (study: Study) => void;
};

export default function StudySelection(props: StudySelectionProps) {
  const { studies, handleStudySelect } = props;

  return (
    <div className={styles["study-selection"]}>
      <h2 className={styles["studies-heading"]}>Your Studies</h2>

      <div className={styles["studies-list"]}>
        {studies.map((study) => (
          <div key={study.id} className={styles["study-card"]}>
            <div className={styles["study-info"]}>
              <h3 className={styles["study-title"]}>{study.title}</h3>
              <p className={styles["study-description"]}>{study.description}</p>
            </div>

            <div className={styles["study-actions"]}>
              <Button onClick={() => handleStudySelect(study)} size="small" variant="tertiary">
                View Details
              </Button>

              <Button onClick={() => handleStudySelect(study)} size="small">
                Manage Study
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
