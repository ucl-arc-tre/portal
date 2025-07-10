import { InfoIcon } from "../assets/exports";
import styles from "./InfoTooltip.module.css";

export default function InfoTooltip(props: { text: string }) {
  return (
    <span className={styles.tooltip}>
      <InfoIcon className={styles.icon} />
      <span className={styles["tooltip__content"]}>{props.text}</span>
    </span>
  );
}
