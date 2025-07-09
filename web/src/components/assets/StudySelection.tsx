import Button from "@/components/ui/Button";
import styles from "./StudySelection.module.css";

type StudySelectionProps = {
  studies: Study[];
  setSelectedStudy: (study: Study) => void;
};

export default function StudySelection(props: StudySelectionProps) {
  const { studies, setSelectedStudy } = props;

  return (
    <div className={styles.studySelection}>
      <h2>Select a Study</h2>
      <p>Please select the study you want to associate this asset with:</p>

      <div className={styles.studiesList}>
        {studies.map((study) => (
          <div key={study.id} className={styles.studyItem}>
            <div className={styles.studyInfo}>
              <h3>{study.title}</h3>
              <p>{study.description}</p>
            </div>

            <Button onClick={() => setSelectedStudy(study)} size="small">
              Select Study
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
