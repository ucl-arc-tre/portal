import Link from "next/link";
import "./Button.css";

type Props = React.ComponentProps<"button"> & {
  inverse?: boolean;
  danger?: boolean;
  size?: string;
  type?: string;
  name?: string;
  value?: string;
  link?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

export default function Button(props: Props) {
  return (
    <button
      className={`button ${`button--${props.size || "medium"}`} ${props.inverse ? "button--inverse" : ""} ${props.link ? "button--nav" : ""} ${props.danger ? "button--danger" : ""} ${props.type === "submit" && "button--submit"}`}
      type={props.type}
      onClick={props.onClick}
      disabled={props.disabled}
      name={props.name}
      value={props.value}
    >
      {props.link ? <Link href={props.link!}>{props.children}</Link> : props.children}
    </button>
  );
}
