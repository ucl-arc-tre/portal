import styles from "./StudyForm.module.css";

export default function YesNoUnsureButtons({
  value,
  onChange,
}: {
  value: boolean | null | undefined;
  onChange: (value: boolean | null) => void;
}) {
  return (
    <div className={styles["yes-no-unsure-buttons"]}>
      <button
        type="button"
        onClick={() => onChange(true)}
        data-cy="option-yes"
        className={value === true ? styles.selected : styles.yes}
      >
        Yes
      </button>
      <button
        type="button"
        data-cy="option-unsure"
        onClick={() => {
          onChange(null);
        }}
        className={value === null || value === undefined ? styles.selected : styles.unsure}
      >
        Unsure
      </button>
      <button
        type="button"
        data-cy="option-no"
        onClick={() => onChange(false)}
        className={value === false ? styles.selected : styles.no}
      >
        No
      </button>
    </div>
  );
}
