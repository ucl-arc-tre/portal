import Link from "next/link";
import styles from "./Button.module.css";
import dynamic from "next/dynamic";

const UCLButton = dynamic(() => import("uikit-react-public").then((mod) => mod.Button), {
  ssr: false,
});

type Props = React.ComponentProps<typeof UCLButton> & {
  type?: string;
  name?: string;
  value?: string;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  cy?: string;
  as?: string;
};

export default function Button(props: Props) {
  return (
    <UCLButton
      data-cy={props.cy}
      className={`${styles.button} ${props.type === "submit" && styles.submit}`}
      type={props.type}
      onClick={props.onClick}
      disabled={props.disabled}
      name={props.name}
      value={props.value}
      as={props.as || "button"}
    >
      {props.href ? <Link href={props.href!}>{props.children}</Link> : props.children}
    </UCLButton>
  );
}
