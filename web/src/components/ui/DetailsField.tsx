import styles from "./DetailsField.module.css";
import { Label } from "@/components/shared/uikitExports";

type Props = {
  label: string;
  value?: string | number;
  children?: React.ReactNode;
};

export default function DetailsField(props: Props) {
  const { label, value, children } = props;

  return (
    <div className={styles.field}>
      <Label>{label}:</Label>
      <span>
        {value}
        {children}
      </span>
    </div>
  );
}
