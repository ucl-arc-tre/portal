import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Alert, AlertMessage, HelperText } from "../shared/uikitExports";
import Button from "../ui/Button";
import { Asset, Environment, Study } from "@/openapi";
import { getProjectNameValidation } from "./lib/projects";
import styles from "./ProjectFormStep1.module.css";
import { ProjectFormData } from "@/types/projects";
import Callout from "../ui/Callout";

type Props = {
  approvedStudies: Study[];
  assets: Asset[] | null;
  environments: Environment[] | null;
  environmentsError: string | null;
  fieldsDisabled: boolean;
  editing: boolean;
};

export default function ProjectFormStep1(props: Props) {
  const { approvedStudies, assets, environments, environmentsError, fieldsDisabled, editing } = props;
  const {
    watch,
    register,
    control,
    formState: { errors },
  } = useFormContext<ProjectFormData>();

  const isLoadingEnvironments = environments === null;
  const isLoadingAssets = assets === null;

  const selectedEnvironmentId = watch("environmentId");
  const selectedEnvironment = environments?.find((env) => env.id === selectedEnvironmentId);

  const selectedAssetIds = watch("assetIds");
  const {
    fields: assetFields,
    append: appendAsset,
    remove: removeAsset,
  } = useFieldArray({
    control,
    name: "assetIds",
  });

  const selectedStudyId = watch("studyId");

  return (
    <>
      <div className="field">
        <label htmlFor="studyId">Study *</label>
        <select
          id="studyId"
          {...register("studyId", {
            required: "Please select a study",
          })}
          disabled={fieldsDisabled || editing}
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
            <AlertMessage>{`${errors.studyId.message}`}</AlertMessage>
          </Alert>
        )}
        <HelperText>Select the study this project will belong to</HelperText>
      </div>

      <div className="field">
        <label htmlFor="environmentId">Environment *</label>
        <select
          id="environmentId"
          {...register("environmentId", {
            required: "Please select an environment",
          })}
          disabled={fieldsDisabled || editing || isLoadingEnvironments || !!environmentsError}
        >
          <option value="">
            {isLoadingEnvironments
              ? "Loading environments..."
              : environmentsError
                ? "Error loading environments"
                : "Select an environment..."}
          </option>
          {environments &&
            environments.map((environment) => (
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
            <AlertMessage>{`${errors.environmentId.message}`}</AlertMessage>
          </Alert>
        )}
        <HelperText>Select the environment where this project will be deployed</HelperText>

        {selectedEnvironmentId &&
          (() => {
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
                  <>
                    <Callout text="DSH Project management is not supported yet, please use the Share Management Tool within the DSH or open a ticket on MyServices" />
                    <div className={styles["environment-docs"]}>
                      <a
                        href="https://www.ucl.ac.uk/isd/services/file-storage-sharing/data-safe-haven-dsh"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View DSH documentation
                      </a>
                    </div>
                  </>
                );
              default:
                return null;
            }
          })()}
      </div>

      <div className="field">
        <label htmlFor="name">Project Name *</label>
        <Controller
          name="name"
          control={control}
          rules={{
            required: "Project name is required",
            validate: {
              format: (value) => {
                if (!selectedEnvironment) return true; // Skip validation if no environment selected

                const validation = getProjectNameValidation(selectedEnvironment.name);

                if (value.length < validation.minLength) {
                  return `Project name must be at least ${validation.minLength} characters`;
                }
                if (value.length > validation.maxLength) {
                  return `Project name must be less than ${validation.maxLength} characters`;
                }
                if (!validation.pattern.test(value)) {
                  return validation.patternMessage;
                }
                return true;
              },
            },
          }}
          render={({ field }) => (
            <input
              {...field}
              id="name"
              type="text"
              placeholder="e.g., myproject"
              disabled={
                fieldsDisabled || editing || !selectedEnvironment || selectedEnvironment.name === "Data Safe Haven"
              }
            />
          )}
        />

        {errors.name && (
          <Alert type="error">
            <AlertMessage>{`${errors.name.message}`}</AlertMessage>
          </Alert>
        )}
        <HelperText>
          {(() => {
            if (!selectedEnvironment) return "Select an environment to see naming requirements";
            return getProjectNameValidation(selectedEnvironment.name).helperText;
          })()}
        </HelperText>
      </div>

      <div className="field">
        <span className={styles["section-label"]}>Add assets (optional):</span>
        <fieldset className="linkage-fieldset">
          {assetFields.map((field, index) => (
            <div key={field.id} className="item-wrapper">
              <label htmlFor={`asset-${index}`} className="item-label">
                Asset {index + 1}:
              </label>
              <Controller
                name={`assetIds.${index}.value` as const}
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    id={`asset-${index}`}
                    disabled={fieldsDisabled || !selectedStudyId || !selectedEnvironmentId || isLoadingAssets}
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
                    {assets &&
                      assets.map((asset) => {
                        const isCompatible =
                          !selectedEnvironmentId || !selectedEnvironment || asset.tier <= selectedEnvironment.tier;
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
              <Button
                onClick={() => removeAsset(index)}
                className="remove-button"
                aria-label={`Remove contract ${index + 1}`}
                type="button"
              >
                ×
              </Button>
            </div>
          ))}
          <Button
            onClick={() => appendAsset({ value: "" })}
            type="button"
            variant="secondary"
            size="small"
            aria-label="Add Asset"
          >
            Add Asset
          </Button>
        </fieldset>
        <HelperText>Optionally link this project to one or more existing assets from the selected study</HelperText>
      </div>
    </>
  );
}
