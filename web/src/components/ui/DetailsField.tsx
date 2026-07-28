import styles from "./DetailsField.module.css";

type Props = {
  label: string;
  value?: string | number;
  children?: React.ReactNode;
};

export default function DetailsField(props: Props) {
  const { label, value, children } = props;

  return (
    <div className={styles.field}>
      <label>{label}:</label>
      <span>
        {value}
        {children}
      </span>
    </div>
  );
}
