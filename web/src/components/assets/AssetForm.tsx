import dynamic from "next/dynamic";
import { useState } from "react";
import { useForm } from "react-hook-form";

import Button from "../ui/Button";

import styles from "./AssetForm.module.css";

const Alert = dynamic(() => import("uikit-react-public").then((mod) => mod.Alert), {
  ssr: false,
});
const AlertMessage = dynamic(() => import("uikit-react-public").then((mod) => mod.Alert.Message), {
  ssr: false,
});

type AssetFormData = {
  title: string;
  description: string;
  classification_impact: number;
  location: string;
  is_active: boolean;
};

type AssetFormProps = {
  onSubmit: (data: AssetFormData) => Promise<void>;
  setSelectedStudy: (study: Study | null) => void;
  isSubmitting?: boolean;
};

export default function AssetForm(props: AssetFormProps) {
  const { onSubmit, setSelectedStudy, isSubmitting = false } = props;

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AssetFormData>({
    defaultValues: {
      title: "",
      description: "",
      classification_impact: 1,
      location: "",
      is_active: true,
    },
  });

  const onFormSubmit = async (data: AssetFormData) => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      await onSubmit(data);
      setSuccessMessage("Asset created successfully!");
      reset();
    } catch (error) {
      console.error("Error creating asset:", error);
      setErrorMessage("Failed to create asset. Please try again.");
    }
  };

  return (
    <div className={styles.container}>
      <h2>Create New Asset</h2>

      {errorMessage && (
        <Alert type="error" className={styles.alert}>
          <AlertMessage>{errorMessage}</AlertMessage>
        </Alert>
      )}

      {successMessage && (
        <Alert type="success" className={styles.alert}>
          <AlertMessage>{successMessage}</AlertMessage>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            type="text"
            {...register("title", {
              required: "Title is required",
              maxLength: { value: 255, message: "Title must be less than 255 characters" },
            })}
            aria-invalid={!!errors.title}
            className={errors.title ? styles.error : ""}
          />
          {errors.title && <span className={styles["error-text"]}>{errors.title.message}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            rows={4}
            {...register("description", {
              required: "Description is required",
              maxLength: { value: 1000, message: "Description must be less than 1000 characters" },
            })}
            aria-invalid={!!errors.description}
            className={errors.description ? styles.error : ""}
          />
          {errors.description && <span className={styles["error-text"]}>{errors.description.message}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="classification_impact">Classification Impact *</label>
          <select
            id="classification_impact"
            {...register("classification_impact", {
              required: "Classification impact is required",
              min: { value: 1, message: "Classification impact must be between 1 and 5" },
              max: { value: 5, message: "Classification impact must be between 1 and 5" },
            })}
            aria-invalid={!!errors.classification_impact}
            className={errors.classification_impact ? styles.error : ""}
          >
            <option value={1}>1 - Low</option>
            <option value={2}>2 - Medium-Low</option>
            <option value={3}>3 - Medium</option>
            <option value={4}>4 - Medium-High</option>
            <option value={5}>5 - High</option>
          </select>
          {errors.classification_impact && (
            <span className={styles["error-text"]}>{errors.classification_impact.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="location">Location *</label>
          <input
            id="location"
            type="text"
            {...register("location", {
              required: "Location is required",
              maxLength: { value: 255, message: "Location must be less than 255 characters" },
            })}
            aria-invalid={!!errors.location}
            className={errors.location ? styles.error : ""}
          />
          {errors.location && <span className={styles["error-text"]}>{errors.location.message}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles["checkbox-label"]}>
            <input type="checkbox" {...register("is_active")} className={styles.checkbox} />
            Active
          </label>
        </div>

        <div className={styles.actions}>
          <Button type="submit" disabled={isSubmitting} className={styles["submit-button"]}>
            {isSubmitting ? "Creating..." : "Create Asset"}
          </Button>

          <Button type="button" variant="secondary" onClick={() => setSelectedStudy(null)} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
