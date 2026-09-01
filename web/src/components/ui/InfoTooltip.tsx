import { iconSizeSmall, InfoIcon } from "../shared/uikitExports";
import styles from "./InfoTooltip.module.css";

export default function InfoTooltip(props: { text: string }) {
  return (
    <span className={styles.tooltip}>
      <InfoIcon className={styles.icon} size={iconSizeSmall} />
      <span className={styles["tooltip__content"]}>{props.text}</span>
    </span>
  );
}
