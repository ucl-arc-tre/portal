import dynamic from "next/dynamic";
import { useState } from "react";
import { useForm } from "react-hook-form";

import Button from "../ui/Button";
import { storageDefinitions } from "@/components/shared/storageDefinitions";

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
  protection: string;
  legal_basis: string;
  format: string;
  expiry: string;
  location: string[];
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
      protection: "",
      legal_basis: "",
      format: "",
      expiry: "",
      location: [],
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
          <div className={styles["info-text"]}>
            <p>
              You should be aware of{" "}
              <a
                href="https://liveuclac.sharepoint.com/sites/ISD.InformationSecurityGroup/Team%20Documents/Policy/Information-Management-Policy_V1.2.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                UCL&apos;s policy on classifying information assets
              </a>{" "}
              before determining a classification.
            </p>
          </div>

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
          <label htmlFor="protection">What protection is applied to this asset in the form described here? *</label>
          <select
            id="protection"
            {...register("protection", {
              required: "Protection type is required",
            })}
            aria-invalid={!!errors.protection}
            className={errors.protection ? styles.error : ""}
          >
            <option value="">Select protection</option>
            <option value="anonymisation">Anonymisation</option>
            <option value="identifiable_low_confidence_pseudonymisation">
              Identifiable of low confidence of pseudonymisation
            </option>
          </select>
          {errors.protection && <span className={styles["error-text"]}>{errors.protection.message}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="legal_basis">What is the legal basis for holding this asset? *</label>
          <input
            id="legal_basis"
            type="text"
            {...register("legal_basis", {
              required: "Legal basis is required",
              maxLength: { value: 255, message: "This must be less than 255 characters" },
            })}
            aria-invalid={!!errors.legal_basis}
            className={errors.legal_basis ? styles.error : ""}
          />
          {errors.legal_basis && <span className={styles["error-text"]}>{errors.legal_basis.message}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="format">What format is the asset in? *</label>
          <select
            id="format"
            {...register("format", {
              required: "Format is required",
            })}
            aria-invalid={!!errors.format}
            className={errors.format ? styles.error : ""}
          >
            <option value="">Select format</option>
            <option value="electronic">Electronic</option>
            <option value="paper">Paper</option>
            <option value="other">Other</option>
          </select>
          {errors.format && <span className={styles["error-text"]}>{errors.format.message}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="expiry" className={styles["red-text"]}>
            What is the asset&apos;s retention expiry date? *
          </label>
          <input
            id="expiry"
            type="date"
            {...register("expiry", {
              required: "Expiry date is required",
            })}
            aria-invalid={!!errors.expiry}
            className={errors.expiry ? styles.error : ""}
          />
          {errors.expiry && <span className={styles["error-text"]}>{errors.expiry.message}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="location">
            Where will these files/items be saved/stored and how will they be moved? Select all of the touchpoints that
            are relevant including backups. *{" "}
            <a
              href="/assets/definitions"
              target="_blank"
              rel="noopener noreferrer"
              className={styles["definitions-link"]}
            >
              What do these options mean? (Must read)
            </a>
          </label>

          <div className={styles["checkbox-group"]}>
            {storageDefinitions.map((storage) => (
              <label key={storage.value} className={styles["checkbox-label"]}>
                <input
                  type="checkbox"
                  value={storage.value}
                  {...register("location", {
                    required: "At least one location must be selected",
                  })}
                  className={styles.checkbox}
                />
                {storage.name}
              </label>
            ))}
          </div>

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
