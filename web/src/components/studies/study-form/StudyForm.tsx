import { useState, useEffect } from "react";
import Dialog from "../../ui/Dialog";
import { Alert, AlertMessage } from "../../shared/uikitExports";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import { postStudies, putStudiesByStudyId, Study } from "@/openapi";
import { extractErrorMessage } from "@/lib/errorHandler";
import { convertStudyFormDataToApiRequest, populateExistingFormData } from "./lib/studyFormUtils";
import StudyFormStep1 from "./StudyFormStep1";
import StudyFormStep2 from "./StudyFormStep2";
import StudyFormStep3 from "./StudyFormStep3";
import StudyFormNavigation from "./StudyFormNavigation";
import StudyFormStepDots from "./StudyFormStepDots";
import styles from "./StudyForm.module.css";

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
    trigger,
    reset,
    formState: { errors },
    getValues,
  } = useForm<StudyFormData>({
    mode: "onChange",
    criteriaMode: "all",
    defaultValues: { title: "", dataControllerOrganisation: "", owner: username, additionalStudyAdminUsernames: [] },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const controllerValue = useWatch({
    name: "dataControllerOrganisation",
    control,
  });

  const nextStep = async () => {
    setError(null);

    if (currentStep === 1) {
      const titleValid = await trigger("title");
      const controllerValid = await trigger("dataControllerOrganisation");
      const descriptionValid = await trigger("description");

      // Validate admin fields if they exist
      const adminValidResults = await Promise.all(
        getValues("additionalStudyAdminUsernames").map((_, index) =>
          trigger(`additionalStudyAdminUsernames.${index}.value` as const)
        )
      );

      if (!titleValid || !descriptionValid || !controllerValid || !adminValidResults.every((valid) => valid)) {
        setError("Please fix the validation errors before proceeding.");
        return;
      }
    }

    // Step 2 is all optional fields
    // Step 3's conditional fields will be validated on final submit
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep(currentStep - 1);
  };

  const onSubmit: SubmitHandler<StudyFormData> = async (data) => {
    setIsSubmitting(true);
    setError(null);

    const studyId = editingStudy?.id;

    try {
      const studyData = convertStudyFormDataToApiRequest(data);

      const response = studyId
        ? await putStudiesByStudyId({ path: { studyId }, body: studyData })
        : await postStudies({ body: studyData });

      if (!response.response.ok) {
        setError(extractErrorMessage(response));
        return;
      }

      onComplete();
    } catch (error) {
      console.error(`Failed to ${studyId ? "update" : "create"} study:`, error);
      setError(`Failed to ${studyId ? "update" : "create"} study. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseForm = () => {
    setError(null);
    setIsFormOpen(false);
  };

  useEffect(() => {
    if (!editingStudy) return;
    reset(populateExistingFormData(editingStudy));
  }, [editingStudy, reset]);

  return (
    <Dialog setDialogOpen={handleCloseForm} className={styles["study-dialog"]} cy="create-study-form">
      <h2>{editingStudy ? "Update Study" : "Create Study"}</h2>

      <StudyFormStepDots currentStep={currentStep} />

      <form className="form" onSubmit={handleSubmit(onSubmit)}>
        {currentStep === 1 && (
          <StudyFormStep1
            control={control}
            errors={errors}
            register={register}
            getValues={getValues}
            username={username}
          />
        )}

        {currentStep === 2 && <StudyFormStep2 control={control} errors={errors} />}

        {currentStep === 3 && <StudyFormStep3 control={control} errors={errors} controllerValue={controllerValue} />}

        <StudyFormNavigation
          currentStep={currentStep}
          isSubmitting={isSubmitting}
          editingStudy={editingStudy}
          onPrev={prevStep}
          onNext={nextStep}
        />

        {error && (
          <Alert type="error">
            {error.split("\n").map((line, index) => (
              <AlertMessage key={index}>{line}</AlertMessage>
            ))}
          </Alert>
        )}
      </form>
    </Dialog>
  );
}
