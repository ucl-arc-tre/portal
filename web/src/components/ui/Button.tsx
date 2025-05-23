import Link from "next/link";
import styles from "./Button.module.css";

type Props = React.ComponentProps<"button"> & {
  danger?: boolean;
  size?: string;
  type?: string;
  name?: string;
  value?: string;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  cy?: string;
};

export default function Button(props: Props) {
  let sizeStyle = styles.medium;
  switch (props.size) {
    case "large": {
      sizeStyle = styles.large;
      break;
    }
    case "small": {
      sizeStyle = styles.small;
      break;
    }
    default: {
      sizeStyle = styles.medium;
    }
  }
  return (
    <button
      data-cy={props.cy}
      className={`${styles.button} ${sizeStyle} ${props.href ? styles.nav : ""} ${props.danger ? styles.danger : ""} ${props.type === "submit" && styles.submit}`}
      type={props.type}
      onClick={props.onClick}
      disabled={props.disabled}
      name={props.name}
      value={props.value}
    >
      {props.href ? <Link href={props.href!}>{props.children}</Link> : props.children}
    </button>
  );
}
