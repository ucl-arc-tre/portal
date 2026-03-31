import styles from "./YesNoUnsureButtons.module.css";

export default function YesNoUnsureButtons({
  value,
  onChange,
}: {
  value: boolean | null | undefined;
  onChange: (value: boolean | null) => void;
}) {
  return (
    <div className={styles["button-group"]}>
      <button
        type="button"
        className={value === true ? styles.selected : styles.yes}
        onClick={() => onChange(true)}
        data-cy="option-yes"
      >
        Yes
      </button>

      <button
        type="button"
        className={value == null ? styles.selected : styles.unsure}
        onClick={() => {
          onChange(null);
        }}
        data-cy="option-unsure"
      >
        Unsure
      </button>

      <button
        type="button"
        className={value === false ? styles.selected : styles.no}
        onClick={() => onChange(false)}
        data-cy="option-no"
      >
        No
      </button>
    </div>
  );
}
