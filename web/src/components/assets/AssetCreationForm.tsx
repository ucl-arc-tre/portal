import { useState } from "react";
import { useForm } from "react-hook-form";

import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import { storageDefinitions } from "@/components/shared/storageDefinitions";

import styles from "./AssetCreationForm.module.css";
import { Alert, AlertMessage } from "../shared/exports";

type AssetFormProps = {
  handleAssetSubmit: (data: AssetFormData) => Promise<void>;
  isSubmitting?: boolean;
  closeModal: () => void;
};

export default function AssetCreationForm(props: AssetFormProps) {
  const { handleAssetSubmit, isSubmitting = false, closeModal } = props;

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
      tier: "",
      protection: "",
      legal_basis: "",
      format: "",
      expires_at: "",
      locations: [],
      requires_contract: false,
      has_dspt: false,
      stored_outside_uk_eea: false,
      status: "",
    },
  });

  const protectionValue = watch("protection");
  const classificationValue = watch("classification_impact");
  const showUCLGuidanceText = protectionValue === "anonymisation" || protectionValue === "pseudonymisation";
  const showTierSelection = classificationValue === "highly_confidential";

  const onFormSubmit = async (data: AssetFormData) => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);

      // Set tier based on classification_impact
      let tier: number;
      if (data.classification_impact === "public") {
        tier = 0;
      } else if (data.classification_impact === "confidential") {
        tier = 1;
      } else {
        // For highly_confidential, convert the user-selected tier to number (2, 3, or 4)
        tier = typeof data.tier === "string" ? parseInt(data.tier, 10) : data.tier;
      }

      // Transform string boolean values to actual booleans for API
      const transformedAssetData: AssetFormData = {
        ...data,
        tier,
        requires_contract: data.requires_contract === "true" || data.requires_contract === true,
        has_dspt: data.has_dspt === "true" || data.has_dspt === true,
        stored_outside_uk_eea: data.stored_outside_uk_eea === "true" || data.stored_outside_uk_eea === true,
      };

      await handleAssetSubmit(transformedAssetData);
      setSuccessMessage("Asset created successfully!");
      reset();
    } catch (error) {
      console.error("Error creating asset:", error);
      setErrorMessage("Error: " + String((error as Error).message));
    }
  };

  return (
    <Dialog setDialogOpen={closeModal} cy="create-asset-form">
      <h2>Create New Asset</h2>

      <form onSubmit={handleSubmit(onFormSubmit)} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            type="text"
            {...register("title", {
              required: "Title is required",
              minLength: { value: 4, message: "Title must be at least 4 characters" },
              maxLength: { value: 50, message: "Title must be less than 50 characters" },
            })}
            aria-invalid={!!errors.title}
            className={errors.title ? styles.error : ""}
          />
          {errors.title && (
            <Alert type="error">
              <AlertMessage>{errors.title.message}</AlertMessage>
            </Alert>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            rows={4}
            {...register("description", {
              required: "Description is required",
              minLength: { value: 4, message: "Description must be at least 4 characters" },
              maxLength: { value: 255, message: "Description must be less than 255 characters" },
            })}
            aria-invalid={!!errors.description}
            className={errors.description ? styles.error : ""}
          />
          {errors.description && (
            <Alert type="error">
              <AlertMessage>{errors.description.message}</AlertMessage>
            </Alert>
          )}
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
            <option value="public">Public</option>
            <option value="confidential">Confidential</option>
            <option value="highly_confidential">Highly confidential</option>
          </select>
          {errors.classification_impact && (
            <Alert type="error">
              <AlertMessage>{errors.classification_impact.message}</AlertMessage>
            </Alert>
          )}
        </div>

        {showTierSelection && (
          <div className={styles.field}>
            <label htmlFor="tier">Security Tier *</label>
            <div className={styles["info-text"]}>
              <p>
                Please select the appropriate security tier based on{" "}
                <a
                  href="https://isms.arc.ucl.ac.uk/rism06-data_classification_and_environment_tiering_policy/#5environment-tier-definition"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  UCL ARC Data Classification and Environment Tiering Policy
                </a>
                .
              </p>
            </div>
            <select
              id="tier"
              {...register("tier", {
                required: showTierSelection ? "Security tier is required for highly confidential assets" : false,
              })}
              aria-invalid={!!errors.tier}
              className={errors.tier ? styles.error : ""}
            >
              <option value="">Select security tier</option>
              <option value={2}>Tier 2</option>
              <option value={3}>Tier 3</option>
              <option value={4}>Tier 4</option>
            </select>
            {errors.tier && (
              <Alert type="error">
                <AlertMessage>{errors.tier.message}</AlertMessage>
              </Alert>
            )}
          </div>
        )}

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
          {errors.protection && (
            <Alert type="error">
              <AlertMessage>{errors.protection.message}</AlertMessage>
            </Alert>
          )}

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
          <div className={styles["info-text"]}>
            <p>
              Select the most relevant legal basis from the six options available. To learn more about the legal basis
              requirements refer to{" "}
              <a
                href="https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/a-guide-to-lawful-basis/"
                target="_blank"
                rel="noopener noreferrer"
              >
                UK GDPR guidance
              </a>
            </p>
          </div>
          <select
            id="legal_basis"
            {...register("legal_basis", {
              required: "Legal basis is required",
            })}
            aria-invalid={!!errors.legal_basis}
            className={errors.legal_basis ? styles.error : ""}
          >
            <option value="">Select legal basis</option>
            <option value="consent">
              Consent: the individual has given clear consent for you to process their personal data for a specific
              purpose
            </option>
            <option value="contract">
              Contract: the processing is necessary for a contract you have with the individual, or because they have
              asked you to take specific steps before entering into a contract
            </option>
            <option value="legal_obligation">
              Legal obligation: the processing is necessary for you to comply with the law (not including contractual
              obligations)
            </option>
            <option value="vital_interests">
              Vital interests: the processing is necessary to protect someone&apos;s life
            </option>
            <option value="public_task">
              Public task: the processing is necessary for you to perform a task in the public interest or for your
              official functions, and the task or function has a clear basis in law
            </option>
            <option value="legitimate_interests">
              Legitimate interests: the processing is necessary for your legitimate interests or the legitimate
              interests of a third party, unless there is a good reason to protect the individual&apos;s personal data
              which overrides those legitimate interests
            </option>
          </select>
          {errors.legal_basis && (
            <Alert type="error">
              <AlertMessage>{errors.legal_basis.message}</AlertMessage>
            </Alert>
          )}
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
          {errors.format && (
            <Alert type="error">
              <AlertMessage>{errors.format.message}</AlertMessage>
            </Alert>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="expires_at" className={styles["red-text"]}>
            What is the asset&apos;s retention expiry date? *
          </label>
          <input
            id="expires_at"
            type="date"
            {...register("expires_at", {
              required: "Expiry date is required",
            })}
            aria-invalid={!!errors.expires_at}
            className={errors.expires_at ? styles.error : ""}
          />
          {errors.expires_at && (
            <Alert type="error">
              <AlertMessage>{errors.expires_at.message}</AlertMessage>
            </Alert>
          )}
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
                  {...register("locations", {
                    required: "At least one location must be selected",
                  })}
                  className={styles.checkbox}
                />
                {storage.name}
              </label>
            ))}
          </div>

          {errors.locations && (
            <Alert type="error">
              <AlertMessage>{errors.locations.message}</AlertMessage>
            </Alert>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="requires_contract">Does this asset require a contract? *</label>
          <p>Answering yes will require you to add a contract document in a later step</p>
          <div className={styles["radio-group"]}>
            <label className={styles["radio-label"]}>
              <input
                type="radio"
                value="true"
                {...register("requires_contract", {
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
                {...register("requires_contract", {
                  required: "Please select yes or no",
                })}
                className={styles.radio}
              />
              No
            </label>
          </div>
          {errors.requires_contract && (
            <Alert type="error">
              <AlertMessage>{errors.requires_contract.message}</AlertMessage>
            </Alert>
          )}
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
          {errors.has_dspt && (
            <Alert type="error">
              <AlertMessage>{errors.has_dspt.message}</AlertMessage>
            </Alert>
          )}
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
            <Alert type="error">
              <AlertMessage>{errors.stored_outside_uk_eea.message}</AlertMessage>
            </Alert>
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
            <option value="active">Active: asset is in environment</option>
            <option value="awaiting">Awaiting: asset awaiting creation in environment</option>
            <option value="destroyed">Destroyed: asset has been destroyed in environment</option>
          </select>
          {errors.status && (
            <Alert type="error">
              <AlertMessage>{errors.status.message}</AlertMessage>
            </Alert>
          )}
        </div>

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

        <div className={styles.actions}>
          <Button type="submit" disabled={isSubmitting} className={styles["submit-button"]}>
            {isSubmitting ? "Creating..." : "Create Asset"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
