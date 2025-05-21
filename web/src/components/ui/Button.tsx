import Link from "next/link";
import "./Button.css";

type Props = React.ComponentProps<"button"> & {
  inverse?: boolean;
  danger?: boolean;
  size?: string;
  type?: string;
  name?: string;
  value?: string;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

export default function Button(props: Props) {
  return (
    <button
      className={`button ${`button--${props.size || "medium"}`} ${props.inverse ? "button--inverse" : ""} ${props.href ? "button--nav" : ""} ${props.danger ? "button--danger" : ""} ${props.type === "submit" && "button--submit"}`}
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
