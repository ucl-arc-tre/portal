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

export const RemoveLinkButton = ({ onClick, index }: { onClick: (index: number) => void; index: number }) => {
  return (
    <button
      type="button"
      onClick={() => onClick(index)}
      className="remove-button"
      aria-label={`Remove contract ${index + 1}`}
    >
      ×
    </button>
  );
};

export const AddLinkButton = ({ onClick, entity }: { onClick: () => void; entity: string }) => {
  return (
    <Button
      type="button"
      onClick={() => onClick()}
      className="add-button"
      variant="secondary"
      size="small"
      aria-label={`Add ${entity}`}
    >
      Add {entity}
    </Button>
  );
};
