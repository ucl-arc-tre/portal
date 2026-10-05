import { ReactNode } from "react";
import Button from "./Button";
import Line from "./Line";
import { InfoIcon } from "./uikitExports";
import styles from "./PageHeader.module.css";

type Props = {
  title: string;
  info?: {
    label: string;
    expanded: boolean;
    onToggle: () => void;
  };
  children?: ReactNode;
};

export default function PageHeader({ title, info, children }: Props) {
  return (
    <>
      <div className={styles.header}>
        <h2>
          {title}
          {info && (
            <Button
              onClick={info.onToggle}
              variant="tertiary"
              size="small"
              inline
              aria-label={info.label}
              aria-expanded={info.expanded}
            >
              <InfoIcon />
            </Button>
          )}
        </h2>
        {children}
      </div>
      <Line />
    </>
  );
}
