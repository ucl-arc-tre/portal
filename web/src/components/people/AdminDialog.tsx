import { useRef } from "react";
import styles from "./AdminDialog.module.css";
import Button from "../ui/Button";
import dynamic from "next/dynamic";
import { XIcon } from "../shared/exports";

const Blanket = dynamic(() => import("uikit-react-public").then((mod) => mod.Blanket), {
  ssr: false,
});

type AdminDialogProps = {
  setDialogOpen: (name: boolean) => void;
  children: React.ReactNode;
};

export default function AdminDialog(AdminDialogProps: AdminDialogProps) {
  const { setDialogOpen, children } = AdminDialogProps;
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
          className={styles.closeButton}
        ></Button>
        {children}
      </dialog>
      <Blanket className={styles.blanket} />
    </>
  );
}
