import { iconSizeSmall, InfoIcon } from "./uikitExports";
import styles from "./InfoTooltip.module.css";

export default function InfoTooltip(props: { text: string, cy?: string }) {
  return (
    <span className={styles.tooltip} data-cy={props.cy}>
      <InfoIcon className={styles.icon} size={iconSizeSmall} />
      <span className={styles["tooltip__content"]}>{props.text}</span>
    </span>
  );
}
