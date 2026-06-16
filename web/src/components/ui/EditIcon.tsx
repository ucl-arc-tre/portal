import dynamic from "next/dynamic";
import styles from "./EditIcon.module.css";

const UCLEditIcon = dynamic(() => import("uikit-react-public").then((mod) => mod.Icon.Edit), {
  ssr: false,
});

type Props = {
  cy?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  label: string;
};

export default function EditIcon(props: Props) {
  return (
    <button data-cy={props.cy} onClick={props.onClick} className={styles.this} aria-label={props.label}>
      <UCLEditIcon />
    </button>
  );
}
