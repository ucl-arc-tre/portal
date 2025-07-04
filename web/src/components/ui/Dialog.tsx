import { useRef } from "react";
import styles from "./Dialog.module.css";
import Button from "./Button";
import dynamic from "next/dynamic";
import { XIcon } from "../assets/exports";

const Blanket = dynamic(() => import("uikit-react-public").then((mod) => mod.Blanket), {
  ssr: false,
});

type DialogProps = {
  setDialogOpen: (name: boolean) => void;
  children: React.ReactNode;
  className?: string;
  cypressId?: string;
};

export default function Dialog(DialogProps: DialogProps) {
  const { setDialogOpen, children, className, cypressId } = DialogProps;
  const dialogRef = useRef<HTMLDialogElement>(null);

  const closeDialog = () => {
    dialogRef.current?.close();
    setDialogOpen(false);
  };

  const combinedClassName = `${styles.dialog}${className ? ` ${className}` : ""}`;

  return (
    <>
      <dialog open ref={dialogRef} className={combinedClassName} data-cy={cypressId}>
        <Button
          type="button"
          variant="tertiary"
          size="small"
          icon={<XIcon />}
          onClick={closeDialog}
          className={styles["close-button"]}
        ></Button>
        {children}
      </dialog>
      <Blanket className={styles.blanket} />
    </>
  );
}
