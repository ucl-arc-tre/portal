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
  classification_impact: string;
  protection: string;
  legal_basis: string;
  format: string;
  expiry: string;
  location: string[];
  has_dspt: boolean;
  stored_outside_uk_eea: boolean;
  accessed_by_third_parties: boolean;
  third_party_agreement: string;
  status: string;
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
    watch,
  } = useForm<AssetFormData>({
    defaultValues: {
      title: "",
      description: "",
      classification_impact: "",
      protection: "",
      legal_basis: "",
      format: "",
      expiry: "",
      location: [],
      has_dspt: false,
      stored_outside_uk_eea: false,
      accessed_by_third_parties: false,
      third_party_agreement: "",
      status: "",
    },
  });

  const protectionValue = watch("protection");
  const showUCLGuidanceText = protectionValue === "anonymisation" || protectionValue === "pseudonymisation";

  const thirdPartyAccessed = watch("accessed_by_third_parties");
  const showThirdPartyDropdown = String(thirdPartyAccessed) === "true";

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
            })}
            aria-invalid={!!errors.classification_impact}
            className={errors.classification_impact ? styles.error : ""}
          >
            <option value="">Select classification</option>
            <option value="Public">Public</option>
            <option value="Confidential">Confidential</option>
            <option value="Highly confidential">Highly confidential</option>
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
            <option value="pseudonymisation">Pseudonymisation</option>
            <option value="identifiable_low_confidence_pseudonymisation">
              Identifiable or low confidence of pseudonymisation
            </option>
          </select>
          {errors.protection && <span className={styles["error-text"]}>{errors.protection.message}</span>}

          {showUCLGuidanceText && (
            <div className={styles["ucl-guidance"]}>
              <p>
                Confirm that{" "}
                <a
                  href="https://www.ucl.ac.uk/data-protection/guidance-staff-students-and-researchers/practical-data-protection-guidance-notices/anonymisation-and"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  UCL guidance on anonymisation and pseudonymisation
                </a>{" "}
                has been applied.
              </p>
            </div>
          )}
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
          <label htmlFor="has_dspt">
            Is this information provided under condition of there being an up to date Data Security & Protection Toolkit
            in place at the organisation? *
          </label>
          <div className={styles["radio-group"]}>
            <label className={styles["radio-label"]}>
              <input
                type="radio"
                value="true"
                {...register("has_dspt", {
                  required: "Please select yes or no",
                })}
                className={styles.radio}
              />
              Yes
            </label>

            <label className={styles["radio-label"]}>
              <input
                type="radio"
                value="false"
                {...register("has_dspt", {
                  required: "Please select yes or no",
                })}
                className={styles.radio}
              />
              No
            </label>
          </div>
          {errors.has_dspt && <span className={styles["error-text"]}>{errors.has_dspt.message}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="stored_outside_uk_eea">
            Is this asset stored or processed outside of the UK and the European Economic Area at all? *
          </label>
          <div className={styles["radio-group"]}>
            <label className={styles["radio-label"]}>
              <input
                type="radio"
                value="true"
                {...register("stored_outside_uk_eea", {
                  required: "Please select yes or no",
                })}
                className={styles.radio}
              />
              Yes
            </label>

            <label className={styles["radio-label"]}>
              <input
                type="radio"
                value="false"
                {...register("stored_outside_uk_eea", {
                  required: "Please select yes or no",
                })}
                className={styles.radio}
              />
              No
            </label>
          </div>
          {errors.stored_outside_uk_eea && (
            <span className={styles["error-text"]}>{errors.stored_outside_uk_eea.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="accessed_by_third_parties">
            Is this asset accessed by or governed by any third parties? *
          </label>
          <div className={styles["radio-group"]}>
            <label className={styles["radio-label"]}>
              <input
                type="radio"
                value="true"
                {...register("accessed_by_third_parties", {
                  required: "Please select yes or no",
                })}
                className={styles.radio}
              />
              Yes
            </label>

            <label className={styles["radio-label"]}>
              <input
                type="radio"
                value="false"
                {...register("accessed_by_third_parties", {
                  required: "Please select yes or no",
                })}
                className={styles.radio}
              />
              No
            </label>
          </div>
          {errors.accessed_by_third_parties && (
            <span className={styles["error-text"]}>{errors.accessed_by_third_parties.message}</span>
          )}

          {showThirdPartyDropdown && (
            // WIP: will need to potentially fetch third party agreements from the API
            <div className={styles["third-party-dropdown"]}>
              <p className={styles["third-party-text"]}>
                If this asset is governed by an agreement with a third party please link to the item from your submitted
                third party information at Stage 2.
              </p>
              <select {...register("third_party_agreement")} className={styles["third-party-select"]}>
                <option value="">Select third party agreement</option>
                <option value="test1">Test1</option>
                <option value="test2">Test2</option>
              </select>
            </div>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="status">Status *</label>
          <select
            id="status"
            {...register("status", {
              required: "Status is required",
            })}
            aria-invalid={!!errors.status}
            className={errors.status ? styles.error : ""}
          >
            <option value="">Select status</option>
            <option value="Active">Active</option>
            <option value="Awaiting">Awaiting</option>
            <option value="Destroyed">Destroyed</option>
          </select>
          {errors.status && <span className={styles["error-text"]}>{errors.status.message}</span>}
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
