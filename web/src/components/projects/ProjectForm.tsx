import { useState, useEffect, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import {
  postProjectsTre,
  putProjectsTreByProjectId,
  ProjectTreRequest,
  Study,
  Environment,
  getStudiesByStudyIdAssets,
  Asset,
  getEnvironments,
  ProjectTreMember,
} from "@/openapi";
import { AnyProject, AnyProjectRoleName, ProjectFormData } from "@/types/projects";
import { extractErrorMessage, responseIsError } from "@/lib/errorHandler";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";

import styles from "./ProjectForm.module.css";
import ProjectFormStep1 from "./ProjectFormStep1";
import ProjectTREStep from "./tre/ProjectFormTRE";
import { Alert, AlertMessage } from "../shared/uikitExports";

type Props = {
  approvedStudies: Study[];
  handleProjectCreated: () => void;
  handleCancelCreate: () => void;
  editingProject?: AnyProject | null;
};

export default function ProjectForm({
  approvedStudies,
  handleProjectCreated,
  handleCancelCreate,
  editingProject,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [environments, setEnvironments] = useState<Environment[] | null>(null);
  const [environmentsError, setEnvironmentsError] = useState<string | null>(null);
  const [assets, setAssets] = useState<Asset[] | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const dialogContentRef = useRef<HTMLDivElement | null>(null);

  const totalSteps = 2;

  const methods = useForm<ProjectFormData>({
    mode: "onChange",
    defaultValues: {
      name: "",
      studyId: "",
      environmentId: "",
      assetIds: [],
      members: [],
      tre: undefined,
    },
  });
  const {
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { isValid },
  } = methods;

  const selectedStudyId = watch("studyId");
  const selectedEnvironmentId = watch("environmentId");
  const selectedEnvironment = environments?.find((env) => env.id === selectedEnvironmentId);
  const isTREProject = selectedEnvironment?.name == "ARC Trusted Research Environment";

  const fieldsDisabled = isSubmitting;
  const editing = editingProject !== null && editingProject !== undefined;

  useEffect(() => {
    const fetchEnvironments = async () => {
      setEnvironments(null);
      setEnvironmentsError(null);
      try {
        const response = await getEnvironments();
        if (responseIsError(response) || !response.data) {
          const errorMsg = extractErrorMessage(response);
          setEnvironmentsError(`Failed to load environments: ${errorMsg}`);
          return;
        }
        setEnvironments(response.data);
      } catch (error) {
        console.error("Failed to fetch environments:", error);
        setEnvironmentsError("Failed to load environments. Please try again later.");
        setEnvironments([]);
      }
    };

    fetchEnvironments();
  }, []);

  // Populate form with existing project data when editing
  useEffect(() => {
    if (editingProject) {
      setValue("name", editingProject.name);
      setValue("studyId", editingProject.study_id);

      const environment = environments?.find((env) => env.name === editingProject.environment_name);
      if (environment) {
        setValue("environmentId", environment.id);
      }

      const projectAssetIds = editingProject.assets?.map((asset) => ({ value: asset.id })) || [];
      setValue("assetIds", projectAssetIds);
      setAssets(editingProject.assets || []);

      const projectMembers =
        editingProject.members?.map((member) => ({
          username: member.username,
          roles: member.roles as AnyProjectRoleName[],
        })) || [];
      setValue("members", projectMembers);

      setValue("tre.numRequiredEgressApprovals", `${editingProject.num_required_egress_approvals}`);
      setValue("tre.externalEncryptionEnabled", editingProject.external_encryption_enabled ? "true" : "false");

      const hasWhitelist = (editingProject.airlock_whitelist ?? []).length > 0;
      setValue("tre.airlockExternalDataEnabled", hasWhitelist ? "true" : "false");
      setValue(
        "tre.airlockWhitelist",
        (editingProject.airlock_whitelist ?? []).map((value) => ({ value }))
      );

      const hasHPCDesktops = editingProject.members.some((member) => member.desktop_config?.hpc_instance_type);
      setValue("tre.requiresHPCDesktops", hasHPCDesktops ? "true" : "false");

      const userConfig = editingProject.members.map((member) => ({
        username: member.username,
        hpcInstance: member.desktop_config?.hpc_instance_type,
      }));
      setValue("tre.userConfig", userConfig);
    }
  }, [editingProject, setValue, environments]);

  useEffect(() => {
    if (!editingProject) {
      setValue("assetIds", []);
    }
  }, [selectedEnvironmentId, setValue, editingProject]);

  // fetch assets dynamically based on selected study
  useEffect(() => {
    const fetchAssets = async () => {
      if (!selectedStudyId || !selectedEnvironmentId) {
        setAssets([]);
        return;
      }

      setAssets(null);
      try {
        const response = await getStudiesByStudyIdAssets({
          path: { studyId: selectedStudyId },
        });

        if (responseIsError(response) || !response.data) {
          const errorMsg = extractErrorMessage(response);
          setError(`Failed to fetch assets: ${errorMsg}`);
          setAssets([]);
          return;
        }
        setAssets(response.data);
      } catch (error) {
        console.error("Failed to fetch assets:", error);
        setError("Failed to fetch assets. Please try again.");
        setAssets([]);
      }
    };

    fetchAssets();
  }, [selectedStudyId, selectedEnvironmentId]);

  useEffect(() => {
    dialogContentRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [currentStep]);

  const nextStep = async () => {
    if (currentStep === totalSteps) return;

    // Validate step 1 fields before proceeding
    if (currentStep === 1) {
      const isValid = await trigger(["name", "studyId", "environmentId"]);
      if (!isValid) return;
    }

    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep !== 1) setCurrentStep(currentStep - 1);
  };

  const submitProject = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Find the selected environment to determine which endpoint to call
      if (!selectedEnvironment) throw new Error("Selected environment not found");

      const assetIds = data.assetIds.map((asset) => asset.value).filter((id) => id !== "");

      let response;

      switch (selectedEnvironment.name) {
        case "ARC Trusted Research Environment":
          if (!data.tre) {
            setError("Missing required TRE data");
            return;
          }

          const hasHPCDesktops = watch("tre.requiresHPCDesktops");
          const usersConfig = data.tre?.userConfig?.map((config) => ({
            username: config.username,
            desktop_config: {
              hpc_instance_type: hasHPCDesktops ? config.hpcInstance : "",
            },
          }));

          const treMembers: Array<ProjectTreMember> = data.members
            .filter((researcher) => researcher.username.trim() !== "")
            .map((researcher) => ({
              username: researcher.username,
              roles: researcher.roles,
              desktop_config: usersConfig?.find((config) => config.username == researcher.username)?.desktop_config,
            }));

          const airlockWhitelist =
            data.tre.airlockExternalDataEnabled === "true"
              ? (data.tre.airlockWhitelist ?? []).map((entry) => entry.value.trim()).filter((value) => value !== "")
              : [];

          // todo HPC body -
          // - check is desktop user and need hpc decktops
          // - check not empty instance

          if (editingProject) {
            // Update existing project (only members and assets)
            response = await putProjectsTreByProjectId({
              path: { projectId: editingProject.id },
              body: {
                asset_ids: assetIds,
                members: treMembers,
                num_required_egress_approvals: Number(data.tre.numRequiredEgressApprovals),
                external_encryption_enabled: data.tre.externalEncryptionEnabled === "true",
                airlock_whitelist: airlockWhitelist,
              },
            });
          } else {
            // Create new project
            const requestBody: ProjectTreRequest = {
              name: data.name,
              study_id: data.studyId,
              asset_ids: assetIds,
              members: treMembers,
              num_required_egress_approvals: Number(data.tre.numRequiredEgressApprovals),
              external_encryption_enabled: data.tre.externalEncryptionEnabled === "true",
              airlock_whitelist: airlockWhitelist,
            };
            response = await postProjectsTre({ body: requestBody });
          }
          break;
        case "Data Safe Haven":
          throw new Error("DSH projects are not yet supported");
        default:
          throw new Error(`Unknown environment: ${selectedEnvironment.name}`);
      }

      if (responseIsError(response)) {
        const errorMsg = extractErrorMessage(response);
        setError(errorMsg);
        return;
      }

      handleProjectCreated();
    } catch (error) {
      console.error(error);
      setError("Something went wrong. Failed to create or update project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog setDialogOpen={handleCancelCreate} contentRef={dialogContentRef}>
      <div>
        <h2>{editingProject ? "Edit Project" : "Create New Project"}</h2>

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

        <FormProvider {...methods}>
          <form className="form" onSubmit={(e) => e.preventDefault()}>
            {currentStep === 1 && (
              <ProjectFormStep1
                approvedStudies={approvedStudies}
                assets={assets}
                environments={environments}
                environmentsError={environmentsError}
                fieldsDisabled={fieldsDisabled}
                editing={editing}
              />
            )}

            {currentStep === 2 && isTREProject && <ProjectTREStep fieldsDisabled={fieldsDisabled} />}

            <div className={styles.actions}>
              {currentStep > 1 && (
                <Button type="button" variant="secondary" onClick={prevStep}>
                  ← Back
                </Button>
              )}

              {currentStep < totalSteps && (
                <Button type="button" onClick={nextStep} cy="next-form-page-button">
                  Next →
                </Button>
              )}

              {currentStep === totalSteps && (
                <Button
                  type="button"
                  disabled={isSubmitting || !isValid}
                  onClick={handleSubmit((data) => submitProject(data))}
                  cy="submit-project-button"
                >
                  {isSubmitting
                    ? editingProject
                      ? "Updating..."
                      : "Creating..."
                    : editingProject
                      ? "Update Project"
                      : "Create Project"}
                </Button>
              )}
            </div>
          </form>
        </FormProvider>
      </div>
    </Dialog>
  );
}
