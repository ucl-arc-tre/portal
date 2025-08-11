import styles from "./Button.module.css";
import dynamic from "next/dynamic";

const UCLButton = dynamic(() => import("uikit-react-public").then((mod) => mod.Button), {
  ssr: false,
});

type Props = React.ComponentProps<typeof UCLButton> & {
  type?: "button" | "submit" | "reset";
  name?: string;
  value?: string;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  cy?: string;
  as?: string;
  className?: string;
  inline?: boolean;
};

export default function Button(props: Props) {
  return (
    <UCLButton
      data-cy={props.cy}
      className={`${props.type === "submit" ? styles.submit : ""} ${props.inline ? styles.inline : ""} ${props.className || ""} `}
      type={props.type || "button"}
      onClick={props.onClick}
      disabled={props.disabled}
      name={props.name}
      value={props.value}
      as={props.href ? "a" : props.as || "button"}
      {...props}
    >
      {props.children}
    </UCLButton>
  );
}
