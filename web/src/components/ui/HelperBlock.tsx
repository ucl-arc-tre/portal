import styles from "./HelperBlock.module.css";
import { HelperText } from "./uikitExports";

type Props = {
  text: string;
};

export default function HelperBlock({ text }: Props) {
  return (
    <div className={styles.helperText}>
      <HelperText>{text}</HelperText>
    </div>
  );
}
