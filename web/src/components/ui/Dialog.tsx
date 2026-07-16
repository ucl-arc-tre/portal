import { useRef } from "react";
import styles from "./Dialog.module.css";
import Button from "./Button";
import dynamic from "next/dynamic";
import { XIcon } from "../shared/uikitExports";

const Blanket = dynamic(() => import("uikit-react-public").then((mod) => mod.Blanket), {
  ssr: false,
});

type DialogProps = {
  setDialogOpen: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  cy?: string;
  contentRef?: React.RefObject<HTMLDivElement | null>;
};

export default function Dialog(DialogProps: DialogProps) {
  const { setDialogOpen, children, className, cy, contentRef: externalContentRef } = DialogProps;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const internalContentRef = useRef<HTMLDivElement | null>(null);
  const contentRef = externalContentRef ?? internalContentRef;

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
          <div className={styles["close-button"]}>
            <Button
              type="button"
              variant="tertiary"
              size="small"
              icon={<XIcon />}
              onClick={closeDialog}
              cy="close-dialog"
            >
              {" "}
              <small>Close</small>
            </Button>
          </div>
          {children}
        </div>
      </dialog>
      <Blanket onClick={closeDialog} className={styles.blanket} />
    </>
  );
}
