import { useRef } from "react";
import styles from "./Dialog.module.css";
import Button from "./Button";
import dynamic from "next/dynamic";
import { XIcon } from "../shared/exports";

const Blanket = dynamic(() => import("uikit-react-public").then((mod) => mod.Blanket), {
  ssr: false,
});

type DialogProps = {
  setDialogOpen: (name: boolean) => void;
  children: React.ReactNode;
  className?: string;
  cy?: string;
};

export default function Dialog(DialogProps: DialogProps) {
  const { setDialogOpen, children, className, cy } = DialogProps;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const closeDialog = () => {
    dialogRef.current?.close();
    setDialogOpen(false);
  };

  const handleNonContentClick = (event: React.MouseEvent<HTMLDialogElement, MouseEvent>) => {
    if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
      closeDialog();
    }
  };

  const combinedClassName = `${styles["dialog-content"]}${className ? ` ${className}` : ""}`;

  return (
    <>
      <dialog open ref={dialogRef} data-cy={cy} className={styles.dialog} onClick={handleNonContentClick}>
        <div className={combinedClassName} ref={contentRef}>
          <Button
            type="button"
            variant="tertiary"
            size="small"
            icon={<XIcon />}
            onClick={closeDialog}
            className={styles["close-button"]}
            cy="close-dialog"
          ></Button>
          {children}
        </div>
      </dialog>
      <Blanket onClick={closeDialog} className={styles.blanket} />
    </>
  );
}
