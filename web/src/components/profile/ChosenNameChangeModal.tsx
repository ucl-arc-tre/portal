import { useState } from "react";
import { useForm } from "react-hook-form";
import dynamic from "next/dynamic";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { postProfileChosenNameChangeRequest } from "@/openapi";
import styles from "./ChosenNameChangeModal.module.css";

const Alert = dynamic(() => import("uikit-react-public").then((mod) => mod.Alert), {
  ssr: false,
});
const AlertMessage = dynamic(() => import("uikit-react-public").then((mod) => mod.Alert.Message), {
  ssr: false,
});

type ChosenNameChangeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentChosenName?: string;
};

type ChosenNameChangeFormData = {
  newChosenName: string;
  reason: string;
};

export default function ChosenNameChangeModal({ isOpen, onClose, currentChosenName }: ChosenNameChangeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChosenNameChangeFormData>();

  const onSubmit = async (data: ChosenNameChangeFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const response = await postProfileChosenNameChangeRequest({
        body: {
          new_chosen_name: data.newChosenName,
          reason: data.reason || undefined,
        },
      });

      if (!response.response.ok) {
        throw new Error("Failed to submit chosen name change request");
      }

      setIsSubmitted(true);
      reset();
    } catch (error) {
      console.error("Failed to submit chosen name change request:", error);
      setErrorMessage("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setErrorMessage(null);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  if (isSubmitted) {
    return (
      <Dialog setDialogOpen={handleClose}>
        <div className={styles.container}>
          <h2>Request Submitted</h2>
          <p className={styles["success-message"]}>
            Your chosen name change request has been submitted successfully. An administrator will review your request
            and contact you via email with updates.
          </p>
          <div className={styles.actions}>
            <Button onClick={handleClose}>Close</Button>
          </div>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog setDialogOpen={handleClose}>
      <div className={styles.container}>
        <h2>Request Chosen Name Change</h2>

        <div className={styles.description}>
          <p>
            To change your chosen name, please submit a request below. An administrator will review your request and
            update your chosen name.
          </p>
          <p>
            <strong>Current chosen name:</strong> {currentChosenName || "Not set"}
          </p>
          <p className={styles.note}>
            <strong>Note:</strong> Chosen name changes require manual approval and may take a few days to process. You
            will receive an email confirmation once the change has been completed.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="newChosenName">Requested new chosen name *</label>
            <input
              id="newChosenName"
              type="text"
              {...register("newChosenName", {
                required: "New chosen name is required",
                minLength: { value: 3, message: "Chosen name must be at least 3 characters" },
                maxLength: { value: 100, message: "Chosen name must be less than 100 characters" },
              })}
              aria-invalid={!!errors.newChosenName}
              className={errors.newChosenName ? styles.error : ""}
              placeholder="Enter your desired chosen name"
            />
            {errors.newChosenName && (
              <Alert type="error">
                <AlertMessage>{errors.newChosenName.message}</AlertMessage>
              </Alert>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="reason">Reason for change (optional)</label>
            <textarea
              id="reason"
              rows={3}
              {...register("reason", {
                maxLength: { value: 500, message: "Reason must be less than 500 characters" },
              })}
              aria-invalid={!!errors.reason}
              className={errors.reason ? styles.error : ""}
              placeholder="Please provide a brief reason for the chosen name change"
            />
            {errors.reason && (
              <Alert type="error">
                <AlertMessage>{errors.reason.message}</AlertMessage>
              </Alert>
            )}
          </div>

          {errorMessage && (
            <Alert type="error">
              <AlertMessage>{errorMessage}</AlertMessage>
            </Alert>
          )}

          <div className={styles.actions}>
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
