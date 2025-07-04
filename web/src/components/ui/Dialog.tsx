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
};

export default function Dialog(DialogProps: DialogProps) {
  const { setDialogOpen, children } = DialogProps;
  const dialogRef = useRef<HTMLDialogElement>(null);

  const closeDialog = () => {
    dialogRef.current?.close();
    setDialogOpen(false);
  };

  return (
    <>
      <dialog open ref={dialogRef} className={styles.dialog} data-cy="training">
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
