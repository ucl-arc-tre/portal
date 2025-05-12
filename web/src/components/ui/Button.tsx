import "./Button.css";

type Props = React.ComponentProps<"button"> & {
  inverse?: boolean;
  danger?: boolean;
  size?: string;
  type?: string;
  name?: string;
  value?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

export default function Button(props: Props) {
  return (
    <button
      className={`button ${`button--${props.size}`} ${props.inverse && "button--inverse"}
      }`}
      type={props.type}
      onClick={props.onClick}
      disabled={props.disabled}
      name={props.name}
      value={props.value}
    >
      {props.children}
    </button>
  );
}
