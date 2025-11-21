import { useState, useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
  postProjectsTre,
  ProjectTreRequest,
  ValidationError,
  Study,
  Asset,
  Environment,
  getStudiesByStudyIdAssets,
  getEnvironments,
} from "@/openapi";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import { HelperText, Alert, AlertMessage } from "../shared/exports";

import styles from "./CreateProjectForm.module.css";

// this should match the domain that is used for the entra ID users in the portal
const domainName = process.env.NEXT_PUBLIC_DOMAIN_NAME || "@ucl.ac.uk";

type ProjectFormData = {
  name: string;
  studyId: string;
  environmentId: string;
  assetIds: { value: string }[];
  additionalApprovedResearchers: { value: string }[];
};

type Props = {
  approvedStudies: Study[];
  handleProjectCreated: () => void;
  handleCancelCreate: () => void;
};

export default function CreateProjectForm({ approvedStudies, handleProjectCreated, handleCancelCreate }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [isLoadingEnvironments, setIsLoadingEnvironments] = useState(true);
  const [environmentsError, setEnvironmentsError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    getValues,
    formState: { errors },
  } = useForm<ProjectFormData>({
    mode: "onChange",
    defaultValues: {
      name: "",
      studyId: "",
      environmentId: "",
      assetIds: [],
      additionalApprovedResearchers: [],
    },
  });

  const selectedStudyId = watch("studyId");
  const selectedEnvironmentId = watch("environmentId");
  const selectedAssetIds = watch("assetIds");
  const {
    fields: assetFields,
    append: appendAsset,
    remove: removeAsset,
  } = useFieldArray({
    control,
    name: "assetIds",
  });

  const {
    fields: researcherFields,
    append: appendResearcher,
    remove: removeResearcher,
  } = useFieldArray({
    control,
    name: "additionalApprovedResearchers",
  });

  // Reset asset selection when environment changes
  useEffect(() => {
    setValue("assetIds", []);
  }, [selectedEnvironmentId, setValue]);

  useEffect(() => {
    const fetchEnvironments = async () => {
      setIsLoadingEnvironments(true);
      setEnvironmentsError(null);
      try {
        const response = await getEnvironments();
        if (response.response.ok && response.data) {
          setEnvironments(response.data);
          if (response.data.length === 0) {
            setEnvironmentsError("No environments available. Please contact your administrator.");
          }
        } else {
          throw new Error(`Failed to fetch environments: ${response.response.status} ${response.response.statusText}`);
        }
      } catch (error) {
        console.error("Failed to fetch environments:", error);
        setEnvironmentsError("Failed to load environments. Please try again later.");
      } finally {
        setIsLoadingEnvironments(false);
      }
    };

    fetchEnvironments();
  }, []);

  // fetch assets dynamically based on selected study
  useEffect(() => {
    const fetchAssets = async () => {
      if (!selectedStudyId || !selectedEnvironmentId) {
        setAssets([]);
        return;
      }

      setIsLoadingAssets(true);
      try {
        const response = await getStudiesByStudyIdAssets({
          path: { studyId: selectedStudyId },
        });

        if (response.response.ok && response.data) {
          setAssets(response.data);
        } else {
          throw new Error(`Failed to fetch assets: ${response.response.status} ${response.response.statusText}`);
        }
      } catch (error) {
        console.error("Failed to fetch assets:", error);
        setAssets([]);
      } finally {
        setIsLoadingAssets(false);
      }
    };

    fetchAssets();
  }, [selectedStudyId, selectedEnvironmentId]);

  const nextStep = () => {
    if (currentStep !== totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep !== 1) setCurrentStep(currentStep - 1);
  };

  const submitProject = async (data: ProjectFormData, options: { isDraft: boolean }) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Find the selected environment to determine which endpoint to call
      const selectedEnvironment = environments.find((env) => env.id === data.environmentId);
      if (!selectedEnvironment) throw new Error("Selected environment not found");

      let response;

      switch (selectedEnvironment.name) {
        case "ARC Trusted Research Environment":
          const assetIds = data.assetIds.map((asset) => asset.value).filter((id) => id !== "");
          const researcherUsernames = data.additionalApprovedResearchers
            .map((researcher) => researcher.value.trim())
            .filter((username) => username !== "")
            .map((username) => `${username}${domainName}`);
          const requestBody: ProjectTreRequest = {
            name: data.name,
            study_id: data.studyId,
            is_draft: options.isDraft,
            ...(assetIds.length > 0 && { asset_ids: assetIds }),
            ...(researcherUsernames.length > 0 && { additional_approved_researcher_usernames: researcherUsernames }),
          };
          response = await postProjectsTre({ body: requestBody });
          break;
        case "Data Safe Haven":
          throw new Error("DSH projects are not yet supported");
        default:
          throw new Error(`Unknown environment: ${selectedEnvironment.name}`);
      }

      if (response.error) {
        const errorData = response.error as ValidationError;
        throw new Error(errorData?.error_message || "Failed to create project");
      }

      handleProjectCreated();
    } catch (error) {
      console.error("Failed to create project:", error);
      setError("Error: " + String((error as Error).message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog setDialogOpen={handleCancelCreate}>
      <div className={styles.container}>
        <h2>Create New Project</h2>

        <div className={styles["step-progress"]}>
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <div
              key={step}
              className={`${styles["step-dot"]} ${currentStep === step ? styles["active"] : ""} ${
                currentStep > step ? styles["completed"] : ""
              }`}
            />
          ))}
        </div>

        {error && (
          <Alert type="error">
            <AlertMessage>{error}</AlertMessage>
          </Alert>
        )}

        <form onSubmit={(e) => e.preventDefault()}>
          {currentStep === 1 && (
            <>
              <div className={styles["form-field"]}>
                <label htmlFor="studyId">Study *</label>
                <select
                  id="studyId"
                  className={styles.select}
                  {...register("studyId", {
                    required: "Please select a study",
                  })}
                  disabled={isSubmitting}
                >
                  <option value="">Select a study...</option>
                  {approvedStudies.map((approvedStudy) => (
                    <option key={approvedStudy.id} value={approvedStudy.id}>
                      {approvedStudy.title}
                    </option>
                  ))}
                </select>
                {errors.studyId && (
                  <Alert type="error">
                    <AlertMessage>{errors.studyId.message}</AlertMessage>
                  </Alert>
                )}
                <HelperText>Select the study this project will belong to</HelperText>
              </div>

              <div className={styles["form-field"]}>
                <label htmlFor="environmentId">Environment *</label>
                <select
                  id="environmentId"
                  className={styles.select}
                  {...register("environmentId", {
                    required: "Please select an environment",
                  })}
                  disabled={isSubmitting || isLoadingEnvironments || !!environmentsError}
                >
                  <option value="">
                    {isLoadingEnvironments
                      ? "Loading environments..."
                      : environmentsError
                        ? "Error loading environments"
                        : "Select an environment..."}
                  </option>
                  {environments.map((environment) => (
                    <option key={environment.id} value={environment.id}>
                      {environment.name} (Tier {environment.tier})
                    </option>
                  ))}
                </select>
                {environmentsError && (
                  <Alert type="error">
                    <AlertMessage>{environmentsError}</AlertMessage>
                  </Alert>
                )}
                {errors.environmentId && (
                  <Alert type="error">
                    <AlertMessage>{errors.environmentId.message}</AlertMessage>
                  </Alert>
                )}
                <HelperText>Select the environment where this project will be deployed</HelperText>

                {selectedEnvironmentId &&
                  (() => {
                    const selectedEnvironment = environments.find((env) => env.id === selectedEnvironmentId);
                    if (!selectedEnvironment) return null;

                    switch (selectedEnvironment.name) {
                      case "ARC Trusted Research Environment":
                        return (
                          <div className={styles["environment-docs"]}>
                            <a href="https://docs.tre.arc.ucl.ac.uk/" target="_blank" rel="noopener noreferrer">
                              View TRE documentation
                            </a>
                          </div>
                        );
                      case "Data Safe Haven":
                        return (
                          <div className={styles["environment-docs"]}>
                            <a
                              href="https://www.ucl.ac.uk/isd/services/file-storage-sharing/data-safe-haven-dsh"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View DSH documentation
                            </a>
                          </div>
                        );
                      default:
                        return null;
                    }
                  })()}
              </div>

              <div className={styles["form-field"]}>
                <label htmlFor="name">Project Name *</label>
                <input
                  id="name"
                  type="text"
                  placeholder="e.g., my-project"
                  {...register("name", {
                    required: "Project name is required",
                    pattern: {
                      value: /^[a-z0-9][a-z0-9-]*[a-z0-9]$/, // todo: select the correct pattern based on the picked environment
                      message:
                        "Must start and end with a lowercase letter or number. Only lowercase letters, numbers, and hyphens allowed.",
                    },
                    minLength: {
                      value: 3,
                      message: "Project name must be at least 3 characters",
                    },
                    maxLength: {
                      value: 50,
                      message: "Project name must be less than 50 characters",
                    },
                  })}
                  disabled={isSubmitting}
                />

                {errors.name && (
                  <Alert type="error">
                    <AlertMessage>{errors.name.message}</AlertMessage>
                  </Alert>
                )}
                <HelperText>Use lowercase letters, numbers, and hyphens only (3-50 characters)</HelperText>
              </div>

              <div className={styles["form-field"]}>
                <span className={styles["section-label"]}>Add assets (optional):</span>
                <fieldset className={styles["dynamic-fieldset"]}>
                  {assetFields.map((field, index) => (
                    <div key={field.id} className={styles["item-wrapper"]}>
                      <label htmlFor={`asset-${index}`} className={styles["item-label"]}>
                        Asset {index + 1}:
                      </label>

                      <Controller
                        name={`assetIds.${index}.value` as const}
                        control={control}
                        render={({ field }) => (
                          <select
                            {...field}
                            id={`asset-${index}`}
                            className={styles.select}
                            disabled={isSubmitting || !selectedStudyId || !selectedEnvironmentId || isLoadingAssets}
                          >
                            <option value="">
                              {!selectedStudyId
                                ? "Select a study first..."
                                : !selectedEnvironmentId
                                  ? "Select an environment first..."
                                  : isLoadingAssets
                                    ? "Loading assets..."
                                    : assets.length === 0
                                      ? "No assets available for this study"
                                      : "Select an asset (optional)..."}
                            </option>
                            {assets.map((asset) => {
                              const selectedEnvironment = environments.find((env) => env.id === selectedEnvironmentId);
                              const isCompatible =
                                !selectedEnvironmentId ||
                                !selectedEnvironment ||
                                asset.tier <= selectedEnvironment.tier;
                              const isAlreadySelected = selectedAssetIds.some(
                                (selected, selectedIndex) => selected.value === asset.id && selectedIndex !== index
                              );
                              const label = isCompatible
                                ? `${asset.title} (Tier ${asset.tier})`
                                : `${asset.title} (Tier ${asset.tier}) - Incompatible with selected environment (max tier ${selectedEnvironment?.tier})`;

                              return (
                                <option key={asset.id} value={asset.id} disabled={!isCompatible || isAlreadySelected}>
                                  {label}
                                  {isAlreadySelected ? " - Already selected" : ""}
                                </option>
                              );
                            })}
                          </select>
                        )}
                      />

                      <button
                        type="button"
                        onClick={() => removeAsset(index)}
                        className={styles["remove-button"]}
                        aria-label={`Remove asset ${index + 1}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  <Button
                    className={styles["add-button"]}
                    type="button"
                    variant="secondary"
                    size="small"
                    onClick={() => appendAsset({ value: "" })}
                  >
                    Add Asset
                  </Button>
                </fieldset>
                <HelperText>
                  Optionally link this project to one or more existing assets from the selected study
                </HelperText>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className={styles["form-field"]}>
                <span className={styles["section-label"]}>Additional Approved Researchers (optional):</span>
                <fieldset className={styles["dynamic-fieldset"]}>
                  {researcherFields.map((field, index) => (
                    <div key={field.id} className={styles["item-wrapper"]}>
                      <label htmlFor={`researcher-${index}`} className={styles["item-label"]}>
                        Researcher {index + 1}:
                      </label>

                      <Controller
                        name={`additionalApprovedResearchers.${index}.value` as const}
                        control={control}
                        rules={{
                          required: "Username is required",
                          validate: {
                            isNotEmpty: (value) => {
                              if (!value || value.trim() === "") {
                                return "Username is required";
                              }
                              return true;
                            },
                            notEmailPart: (value) => {
                              if (value.includes("@")) {
                                return `Enter only the username part (without ${domainName})`;
                              }
                              return true;
                            },
                            isUnique: (value) => {
                              const allUsernames = getValues("additionalApprovedResearchers").map((r) => r.value);
                              const duplicateCount = allUsernames.filter((username) => username === value).length;
                              return duplicateCount <= 1 || "Username has already been entered";
                            },
                          },
                        }}
                        render={({ field, fieldState }) => (
                          <div className={styles["username-input-wrapper"]}>
                            <div>
                              <input
                                {...field}
                                id={`researcher-${index}`}
                                type="text"
                                placeholder="Valid username"
                                className={styles.select}
                                disabled={isSubmitting}
                              />
                              <span className={styles["domain-suffix"]}>{domainName}</span>
                            </div>
                            {fieldState.error && (
                              <Alert type="error">
                                <AlertMessage>{fieldState.error.message}</AlertMessage>
                              </Alert>
                            )}
                          </div>
                        )}
                      />

                      <button
                        type="button"
                        onClick={() => removeResearcher(index)}
                        className={styles["remove-button"]}
                        aria-label={`Remove researcher ${index + 1}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  <Button
                    className={styles["add-button"]}
                    type="button"
                    variant="secondary"
                    size="small"
                    onClick={() => appendResearcher({ value: "" })}
                  >
                    Add Researcher
                  </Button>
                </fieldset>
                <HelperText>Optionally add approved researchers to this project</HelperText>
              </div>
            </>
          )}

          <div className={styles.actions}>
            {currentStep > 1 && (
              <Button type="button" variant="secondary" onClick={prevStep}>
                ← Back
              </Button>
            )}

            {currentStep < totalSteps && (
              <Button type="button" onClick={nextStep}>
                Next →
              </Button>
            )}

            {currentStep === totalSteps && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isSubmitting}
                  onClick={handleSubmit((data) => submitProject(data, { isDraft: true }))}
                >
                  {isSubmitting ? "Saving..." : "Save as Draft"}
                </Button>

                <Button
                  className="create-project-button"
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmit((data) => submitProject(data, { isDraft: false }))}
                >
                  {isSubmitting ? "Creating..." : "Create Project"}
                </Button>
              </>
            )}
          </div>
        </form>
      </div>
    </Dialog>
  );
}
