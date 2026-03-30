import { useState, useEffect } from "react";
import Button from "../../ui/Button";
import Dialog from "../../ui/Dialog";
import { Alert, AlertMessage } from "../../shared/uikitExports";
import styles from "./StudyForm.module.css";
import { SubmitHandler, useForm, useWatch, useFieldArray } from "react-hook-form";
import { postStudies, putStudiesByStudyId, Study } from "@/openapi";
import { extractErrorMessage } from "@/lib/errorHandler";
import { convertStudyFormDataToApiRequest, UclDpoId } from "./studyFormUtils";
import StudyFormStep1 from "./StudyFormStep1";
import StudyFormStep2 from "./StudyFormStep2";
import StudyFormStep3 from "./StudyFormStep3";

type StudyProps = {
  username: string;
  setIsFormOpen: (name: boolean) => void;
  onComplete: () => void;
  editingStudy?: Study | null;
};

export default function StudyForm(StudyProps: StudyProps) {
  const { username, setIsFormOpen, onComplete, editingStudy } = StudyProps;
  const {
    register,
    handleSubmit,
    control,
    setValue,
    trigger,
    reset,
    formState: { errors, isValid },
    getValues,
  } = useForm<StudyFormData>({
    mode: "onChange",
    criteriaMode: "all",
    defaultValues: { title: "", dataControllerOrganisation: "", owner: username, additionalStudyAdminUsernames: [] },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [stepValidationError, setStepValidationError] = useState<string | null>(null);
  const totalSteps = 3;

  const nextStep = async () => {
    setStepValidationError(null);

    if (currentStep === 1) {
      const titleValid = await trigger("title");
      const controllerValid = await trigger("dataControllerOrganisation");
      const descriptionValid = await trigger("description");

      // Validate admin fields if they exist
      const adminValidResults = await Promise.all(
        fields.map((_, index) => trigger(`additionalStudyAdminUsernames.${index}.value` as const))
      );

      if (!titleValid || !descriptionValid || !controllerValid || !adminValidResults.every((valid) => valid)) {
        setStepValidationError("Please fix the validation errors before proceeding.");
        return;
      }
    }

    // Step 2 is all optional fields
    // Step 3's conditional fields will be validated on final submit
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setStepValidationError(null);
    setCurrentStep(currentStep - 1);
  };

  const { fields, append, remove } = useFieldArray<StudyFormData, "additionalStudyAdminUsernames", "id">({
    control,
    name: "additionalStudyAdminUsernames",
  });

  const controllerValue = useWatch({
    name: "dataControllerOrganisation",
    control,
  });

  // Update dataProtectionPrefix when controller changes
  useEffect(() => {
    if (controllerValue?.toLowerCase() === "ucl") {
      setValue("dataProtectionPrefix", UclDpoId);
    } else if (editingStudy && editingStudy.data_protection_number) {
      setValue("dataProtectionPrefix", editingStudy.data_protection_number.split("/")[0]);
    } else {
      setValue("dataProtectionPrefix", "");
    }
  }, [controllerValue, setValue]);

  // if update get the study to populate the fields
  useEffect(() => {
    if (editingStudy) {
      const study = editingStudy;
      reset({
        title: study.title,
        description: study.description?.trim(),
        owner: study.owner_username!,
        additionalStudyAdminUsernames: study.additional_study_admin_usernames.map((username) => ({
          value: username!,
        })),
        dataControllerOrganisation: study.data_controller_organisation,
        cagReference: study.cag_reference || "",
        dataProtectionPrefix: study.data_protection_number?.split("/")[0],
        dataProtectionDate: `${study.data_protection_number?.split("/")[1]}-${study.data_protection_number?.split("/")[2]}`,
        dataProtectionId: study.data_protection_number?.split("/")[3],
        dataProtectionNumber: study.data_protection_number,
        nhsEnglandReference: study.nhs_england_reference?.split(/(?<=DARS-NIC-)(\d{6}-\d{5}-\d{2})/)[1] || "",
        irasId: study.iras_id || "",
        involvesUclSponsorship: study.involves_ucl_sponsorship,
        involvesCag: study.involves_cag,
        involvesEthicsApproval: study.involves_ethics_approval,
        involvesHraApproval: study.involves_hra_approval,
        requiresDbs: study.requires_dbs,
        isDataProtectionOfficeRegistered: study.is_data_protection_office_registered,
        involvesThirdParty: study.involves_third_party,
        involvesExternalUsers: study.involves_external_users,
        involvesParticipantConsent: study.involves_participant_consent,
        involvesIndirectDataCollection: study.involves_indirect_data_collection,
        involvesDataProcessingOutsideEea: study.involves_data_processing_outside_eea,
        isNhsAssociated: study.is_nhs_associated,
        involvesNhsEngland: study.involves_nhs_england,
        involvesMnca: study.involves_mnca,
        requiresDspt: study.requires_dspt,
      });
      if (study.data_protection_number) {
        setValue("dataProtectionPrefix", study.data_protection_number.split("/")[0]);
      }
      if (study.nhs_england_reference) {
        setValue(
          "nhsEnglandReference",
          study.nhs_england_reference.split(/(?<=DARS-NIC-)(\d{6}-\d{5}-\d{2})/)[1] || ""
        );
      }
    }
  }, [editingStudy, username, reset]);

  const handleStudySubmit = async (data: StudyFormData, editingStudy?: Study | null) => {
    setIsSubmitting(true);
    setSubmitError(null);

    const studyId = editingStudy?.id;

    try {
      const studyData = convertStudyFormDataToApiRequest(data);

      let response;
      if (!studyId) {
        response = await postStudies({
          body: studyData,
        });
      } else {
        response = await putStudiesByStudyId({
          path: { studyId },
          body: studyData,
        });
      }
      if (!response.response.ok) {
        const errorMsg = extractErrorMessage(response);
        setSubmitError(errorMsg);
        return;
      }

      onComplete();
    } catch (error) {
      console.error(`Failed to ${studyId ? "update" : "create"} study:`, error);
      setSubmitError(`Failed to ${studyId ? "update" : "create"} study Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit: SubmitHandler<StudyFormData> = async (data) => {
    await handleStudySubmit(data, editingStudy);
  };

  const handleCloseForm = () => {
    setSubmitError(null);
    setIsFormOpen(false);
  };

  const getFieldsetClass = (step: number) =>
    `${styles.fieldset} ${currentStep === step ? styles.visible : styles.hidden}`;

  return (
    <Dialog setDialogOpen={handleCloseForm} className={styles["study-dialog"]} cy="create-study-form">
      <h2>{editingStudy ? "Update Study" : "Create Study"}</h2>
      <div className={styles["step-progress"]}>
        <div
          className={`${styles["step-dot"]} ${currentStep === 1 ? styles["active"] : ""} ${isValid ? styles.valid : ""}`}
        ></div>
        {/* not checking if valid because only optional fields */}
        <div className={`${styles["step-dot"]} ${currentStep === 2 ? styles["active"] : ""}`}></div>{" "}
        <div className={`${styles["step-dot"]} ${currentStep === 3 ? styles["active"] : ""}`}></div>
      </div>

      <form className="form" onSubmit={handleSubmit(onSubmit)}>
        {submitError && (
          <div className={styles["error-alert"]}>
            {submitError.split("\n").map((line, index) => (
              <div key={index} className={styles["error-line"]}>
                {line}
              </div>
            ))}
          </div>
        )}

        <StudyFormStep1
          control={control}
          errors={errors}
          register={register}
          getValues={getValues}
          fields={fields}
          append={append}
          remove={remove}
          username={username}
          className={getFieldsetClass(1)}
        />

        <StudyFormStep2 control={control} errors={errors} className={getFieldsetClass(2)} />

        <StudyFormStep3
          control={control}
          errors={errors}
          controllerValue={controllerValue}
          className={getFieldsetClass(3)}
        />

        {stepValidationError && (
          <Alert type="error">
            <AlertMessage>{stepValidationError}</AlertMessage>
          </Alert>
        )}

        <div className={styles["buttons-container"]}>
          {currentStep > 1 && (
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={prevStep}
              className={styles["button--back"]}
              cy="back"
            >
              &larr; Back
            </Button>
          )}

          {currentStep < totalSteps && (
            <Button
              type="button"
              size="small"
              onClick={() => nextStep()}
              className={styles["button--continue"]}
              cy="next"
            >
              Next &rarr;
            </Button>
          )}
        </div>

        {currentStep === totalSteps && (
          <Button type="submit" disabled={isSubmitting}>
            {editingStudy && isSubmitting ? "Updating study..." : editingStudy && "Update Study"}
            {!editingStudy && isSubmitting ? "Creating study..." : !editingStudy && "Create Study"}
          </Button>
        )}
      </form>
    </Dialog>
  );
}
