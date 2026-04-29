import Dialog from "./Dialog";
import Button from "./Button";
import { Alert, AlertMessage } from "../shared/uikitExports";
import styles from "./ConfirmDeleteModal.module.css";

type ConfirmDeleteModalProps = {
  title: string;
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
  error?: string | null;
};

export default function ConfirmDeleteModal({
  title,
  message,
  onConfirm,
  onCancel,
  isDeleting = false,
  error,
}: ConfirmDeleteModalProps) {
  return (
    <Dialog setDialogOpen={onCancel}>
      <div className={styles.container}>
        <h2>{title}</h2>
        <div className={styles.message}>{message}</div>

        {error && (
          <Alert type="error">
            <AlertMessage>{error}</AlertMessage>
          </Alert>
        )}

        <div className={styles.actions}>
          <Button onClick={onCancel} variant="secondary" disabled={isDeleting}>
            Cancel
          </Button>

          <Button onClick={onConfirm} className="delete-button" disabled={isDeleting} cy="confirm-delete">
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
