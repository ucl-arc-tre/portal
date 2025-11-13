import { useState } from "react";
import { useForm } from "react-hook-form";
import { postProjectsTre, ProjectTreRequest, ValidationError, Study } from "@/openapi";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import { HelperText, Alert, AlertMessage } from "../shared/exports";

import styles from "./CreateProjectForm.module.css";

type ProjectFormData = {
  name: string;
  studyId: string;
  environment: "tre" | "dsh";
};

type Props = {
  studies: Study[];
  handleProjectCreated: () => void;
  handleCancelCreate: () => void;
};

export default function CreateProjectForm({ studies, handleProjectCreated, handleCancelCreate }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>({
    defaultValues: {
      name: "",
      studyId: "",
      environment: undefined,
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      let response;

      switch (data.environment) {
        case "tre": {
          const requestBody: ProjectTreRequest = {
            name: data.name,
            study_id: data.studyId,
          };
          response = await postProjectsTre({ body: requestBody });
          break;
        }
        case "dsh":
          throw new Error("DSH projects are not yet supported");
        default:
          throw new Error(`Unknown environment: ${data.environment}`);
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

        {error && (
          <Alert type="error">
            <AlertMessage>{error}</AlertMessage>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
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
              {studies
                .filter((study) => study.approval_status === "Approved")
                .map((study) => (
                  <option key={study.id} value={study.id}>
                    {study.title}
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
            <div className={styles["field-label"]}>Environment *</div>
            <div className={styles["radio-group"]}>
              <label className={styles["radio-option"]}>
                <input
                  type="radio"
                  value="tre"
                  {...register("environment", { required: "Please select an environment" })}
                  disabled={isSubmitting}
                />
                <span>TRE (Trusted Research Environment)</span>
              </label>

              <label className={styles["radio-option-disabled"]}>
                <input type="radio" value="dsh" disabled />
                <span>DSH (Data Safe Haven) - Coming Soon</span>
              </label>
            </div>

            {errors.environment && (
              <Alert type="error">
                <AlertMessage>{errors.environment.message}</AlertMessage>
              </Alert>
            )}
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
                  value: /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
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

          <div className={styles.actions}>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
