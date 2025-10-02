import { useState, useEffect } from "react";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import { Input, Alert, AlertMessage, Label, HelperText, Textarea } from "../shared/exports";
import styles from "./StudyForm.module.css";
import { Controller, SubmitHandler, useForm, useWatch, useFieldArray } from "react-hook-form";
import { postStudies, postStudiesByStudyId, Study, StudyRequest, ValidationError } from "@/openapi";

export type StudyFormData = {
  title: string;
  description: string;
  owner: string;
  additionalStudyAdminUsernames: { value: string }[];
  dataControllerOrganisation: string;
  cagReference: string;
  dataProtectionPrefix: string;
  dataProtectionDate: string;
  dataProtectionId: number;
  dataProtectionNumber: string;
  nhsEnglandReference: number;
  irasId: string;
  involvesUclSponsorship: boolean;
  involvesCag: boolean;
  involvesEthicsApproval: boolean;
  involvesHraApproval: boolean;
  requiresDbs: boolean;
  isDataProtectionOfficeRegistered: boolean;
  involvesThirdParty: boolean;
  involvesExternalUsers: boolean;
  involvesParticipantConsent: boolean;
  involvesIndirectDataCollection: boolean;
  involvesDataProcessingOutsideEea: boolean;
  isNhsAssociated: boolean;
  involvesNhsEngland: boolean;
  involvesMnca: boolean;
  requiresDspt: boolean;
};

type StudyProps = {
  username: string;
  setStudyFormOpen: (name: boolean) => void;
  fetchStudies?: () => void;
  editingStudy?: Study | null;
};

const convertStudyFormDataToApiRequest = (data: StudyFormData) => {
  const studyData: StudyRequest = {
    title: data.title,
    description: data.description ? data.description : undefined,
    data_controller_organisation: data.dataControllerOrganisation.toLowerCase(),
    additional_study_admin_usernames: data.additionalStudyAdminUsernames
      .map((admin) => admin.value.trim())
      .map((username) => `${username}${domainName}`),
    involves_ucl_sponsorship: data.involvesUclSponsorship ? data.involvesUclSponsorship : undefined,
    involves_cag: data.involvesCag ? data.involvesCag : undefined,
    cag_reference: data.cagReference ? data.cagReference.toString() : undefined,
    involves_ethics_approval: data.involvesEthicsApproval ? data.involvesEthicsApproval : undefined,
    involves_hra_approval: data.involvesHraApproval ? data.involvesHraApproval : undefined,
    iras_id: data.irasId ? data.irasId : undefined,
    is_nhs_associated: data.isNhsAssociated ? data.isNhsAssociated : undefined,
    involves_nhs_england: data.involvesNhsEngland ? data.involvesNhsEngland : undefined,
    nhs_england_reference: data.nhsEnglandReference ? data.nhsEnglandReference.toString() : undefined,
    involves_mnca: data.involvesMnca ? data.involvesMnca : undefined,
    requires_dspt: data.requiresDspt ? data.requiresDspt : undefined,
    requires_dbs: data.requiresDbs ? data.requiresDbs : undefined,
    is_data_protection_office_registered: data.isDataProtectionOfficeRegistered
      ? data.isDataProtectionOfficeRegistered
      : undefined,
    data_protection_number:
      data.dataProtectionPrefix && data.dataProtectionDate && data.dataProtectionId
        ? `${data.dataProtectionPrefix}/${data.dataProtectionDate}/${data.dataProtectionId}`
        : undefined,
    involves_third_party: data.involvesThirdParty ? data.involvesThirdParty : undefined,
    involves_external_users: data.involvesExternalUsers ? data.involvesExternalUsers : undefined,
    involves_participant_consent: data.involvesParticipantConsent ? data.involvesParticipantConsent : undefined,
    involves_indirect_data_collection: data.involvesIndirectDataCollection
      ? data.involvesIndirectDataCollection
      : undefined,
    involves_data_processing_outside_eea: data.involvesDataProcessingOutsideEea
      ? data.involvesDataProcessingOutsideEea
      : undefined,
  };

  return studyData;
};

// data protection office id
const UclDpoId = "Z6364106";

// this should match the domain that is used for the entra ID users in the portal
const domainName = process.env.NEXT_PUBLIC_DOMAIN_NAME || "@ucl.ac.uk";

export default function StudyForm(StudyProps: StudyProps) {
  const { username, setStudyFormOpen, fetchStudies, editingStudy } = StudyProps;
  const {
    register,
    handleSubmit,
    control,
    setValue,
    trigger,
    reset,
    formState: { errors, isValid },
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

      // Validate admin fields if they exist
      const adminValidResults = await Promise.all(
        fields.map((_, index) => trigger(`additionalStudyAdminUsernames.${index}.value` as const))
      );

      if (!titleValid || !controllerValid || !adminValidResults.every((valid) => valid)) {
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

  const showCagRef = useWatch({
    name: "involvesCag",
    control,
  });
  const showIrasId = useWatch({
    name: "involvesHraApproval",
    control,
  });
  const showDataProtectionNumber = useWatch({
    name: "isDataProtectionOfficeRegistered",
    control,
  });
  const showNhsRelated = useWatch({
    name: "isNhsAssociated",
    control,
  });
  const showNhsEnglandRef = useWatch({
    name: "involvesNhsEngland",
    control,
  });
  const controllerValue = useWatch({
    name: "dataControllerOrganisation",
    control,
  });

  // Update dataProtectionPrefix when controller changes
  useEffect(() => {
    if (controllerValue?.toLowerCase() === "ucl") {
      setValue("dataProtectionPrefix", UclDpoId);
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
        description: study.description,
        owner: study.owner_username!,
        additionalStudyAdminUsernames: study.additional_study_admin_usernames.map((username) => ({
          value: username.split("@")[0],
        })),
        dataControllerOrganisation: study.data_controller_organisation,
        cagReference: study.cag_reference,
        dataProtectionPrefix: study.data_protection_number?.split("/")[0],
        dataProtectionDate: study.data_protection_number?.split("/")[1],
        dataProtectionId: Number(study.data_protection_number?.split("/")[2]),
        dataProtectionNumber: study.data_protection_number,
        nhsEnglandReference: Number(study.nhs_england_reference),
        irasId: study.iras_id,
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
    }
  }, [editingStudy, username, reset]);

  const handleStudySubmit = async (data: StudyFormData, studyId?: string) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Convert form data to API format
      const studyData = convertStudyFormDataToApiRequest(data);

      let response;
      if (!studyId) {
        response = await postStudies({
          body: studyData,
        });
      } else {
        response = await postStudiesByStudyId({
          path: { studyId },
          body: studyData,
        });
      }
      console.log(response);
      if (response.data) {
        setStudyFormOpen(false);
        if (fetchStudies) {
          fetchStudies();
        }
        return;
      }

      if (response.error) {
        const errorData = response.error as ValidationError;
        if (errorData?.error_message) {
          setSubmitError(errorData.error_message);
          return;
        }
      }

      setSubmitError("An unknown error occurred.");
    } catch (error) {
      console.error(`Failed to ${studyId ? "update" : "create"} study:`, error);
      setSubmitError(`Failed to ${studyId ? "update" : "create"} study Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };
  const onSubmit: SubmitHandler<StudyFormData> = async (data) => {
    if (!editingStudy) {
      await handleStudySubmit(data);
    } else {
      await handleStudySubmit(data, editingStudy.id);
    }
  };

  const handleCloseForm = () => {
    setSubmitError(null);
    setStudyFormOpen(false);
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

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        {submitError && (
          <div className={styles["error-alert"]}>
            {submitError.split("\n").map((line, index) => (
              <div key={index} className={styles["error-line"]}>
                {line}
              </div>
            ))}
          </div>
        )}

        {/* first step */}
        <fieldset className={getFieldsetClass(1)}>
          <legend>Study Details</legend>
          <Label htmlFor="studyName">
            Study Name*:
            <Controller
              name="title"
              control={control}
              rules={{
                required: "This field is required",
                pattern: {
                  value: /^\w[\w\s\-]{2,48}\w$/,
                  message:
                    "Study title must be 4-50 characters, start and end with a letter/number, and contain only letters, numbers, spaces, and hyphens",
                },
              }}
              render={({ field }) => <Input {...field} type="text" id="studyName" />}
            />
            <HelperText>
              Study title must be 4-50 characters, start and end with a letter/number, only letters, numbers, spaces,
              and hyphens allowed
            </HelperText>
            {errors.title && (
              <Alert type="error">
                <AlertMessage>{errors.title.message}</AlertMessage>
              </Alert>
            )}
          </Label>

          <Label htmlFor="description">
            Study Description:
            <Controller
              name="description"
              control={control}
              rules={{ maxLength: 255 }}
              render={({ field }) => <Textarea {...field} id="description" />}
            />
          </Label>
        </fieldset>

        <fieldset className={getFieldsetClass(1)}>
          <legend>Ownership</legend>
          <Label htmlFor="owner">
            Study Owner (PI):
            <Input
              type="email"
              id="owner"
              {...register("owner")}
              readOnly={true}
              value={username}
              inputClassName={styles.readonly}
            />
            <HelperText>
              If you are not the study owner, contact the owner and ask them to fill out this form on their account.
            </HelperText>
          </Label>
          <Label>
            Additional Study Administrators (optional):
            <fieldset className={styles.fieldset}>
              <HelperText style={{ marginBottom: "1rem" }}>
                Add UCL staff members who will help administrate this study. <strong>Must</strong> be valid UCL staff
                usernames.
              </HelperText>

              {fields.map((field, index) => (
                <div key={field.id} className={styles["admin-wrapper"]}>
                  <Label htmlFor={`admin-${index}`} className={styles["admin-label"]}>
                    Administrator {index + 1}:
                    <Controller
                      name={`additionalStudyAdminUsernames.${index}.value` as const}
                      control={control}
                      rules={{
                        required: "Username is required",
                        validate: (value) => {
                          if (!value || value.trim() === "") {
                            return "Username is required";
                          }
                          if (value.includes("@")) {
                            return `Enter only the username part (without ${domainName})`;
                          }
                          return true;
                        },
                      }}
                      render={({ field, fieldState }) => (
                        <div className={styles["username-input-wrapper"]}>
                          <div>
                            <Input {...field} type="text" id={`admin-${index}`} placeholder="Valid UCL username" />
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
                  </Label>

                  <Button type="button" onClick={() => remove(index)} size="small">
                    Remove
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="secondary"
                size="small"
                onClick={() => append({ value: "" })}
                style={{ marginTop: "0.5rem" }}
              >
                Add Administrator
              </Button>
            </fieldset>
          </Label>

          <Label htmlFor="controller">
            Data Controller (organisation)*:
            <Controller
              name="dataControllerOrganisation"
              control={control}
              rules={{ required: "This field is required" }}
              render={({ field }) => <Input {...field} type="text" id="controller" placeholder={`e.g. "UCL"`} />}
            />
            <HelperText>Enter the organization acting as data controller (e.g., &quot;UCL&quot;)</HelperText>
            {errors.dataControllerOrganisation && (
              <Alert type="error">
                <AlertMessage>{errors.dataControllerOrganisation.message}</AlertMessage>
              </Alert>
            )}
          </Label>
        </fieldset>

        {/* second step */}
        <fieldset className={getFieldsetClass(2)}>
          <legend>Sponsorship & Approvals</legend>
          <Label htmlFor="uclSponsorship" className={styles["checkbox-label"]}>
            <input type="checkbox" id="uclSponsorship" {...register("involvesUclSponsorship")} />{" "}
            <span>
              We will be seeking/have sought{" "}
              <a href="https://www.ucl.ac.uk/joint-research-office/new-studies/sponsorship-and-grant-submissions">
                UCL sponsorship
              </a>{" "}
              of this research
            </span>
          </Label>

          <Label htmlFor="cag" className={styles["checkbox-label"]}>
            <input type="checkbox" id="cag" {...register("involvesCag")} />
            <span>
              {" "}
              We will be seeking/have sought approval from the{" "}
              <a href="https://www.hra.nhs.uk/about-us/committees-and-services/confidentiality-advisory-group/">
                Confidentiality Advisory Group
              </a>{" "}
              for this research
            </span>
          </Label>

          {showCagRef && (
            <Label htmlFor="cagRef">
              Confidentiality Advisory Group Reference
              <Input type="text" id="cagRef" {...register("cagReference")} />
            </Label>
          )}

          <Label htmlFor="ethics" className={styles["checkbox-label"]}>
            <input type="checkbox" id="ethics" {...register("involvesEthicsApproval")} />
            We will be seeking/have sought Research Ethics Committee approval for this research
          </Label>

          <Label htmlFor="hra" className={styles["checkbox-label"]}>
            <input type="checkbox" id="hra" {...register("involvesHraApproval")} />{" "}
            <span>
              We will be seeking/have sought{" "}
              <a href="https://www.hra.nhs.uk/approvals-amendments/what-approvals-do-i-need/hra-approval/">
                Health Research Authority
              </a>{" "}
              approval of this research
            </span>
          </Label>

          {showIrasId && (
            <Label htmlFor="irasId">
              <span>
                {" "}
                <a href="https://www.gov.uk/guidance/clinical-trials-for-medicines-apply-for-approval-in-the-uk#:~:text=Integrated%20Research%20Application%20System%20(IRAS)">
                  IRAS
                </a>{" "}
                ID (if applicable)
              </span>

              <Input type="text" id="irasId" {...register("irasId")} />
            </Label>
          )}
        </fieldset>

        <fieldset className={getFieldsetClass(2)}>
          <legend>NHS</legend>

          <Label htmlFor="nhs" className={styles["checkbox-label"]}>
            <input type="checkbox" id="nhs" {...register("isNhsAssociated")} />
            This research is associated with the NHS, uses NHS data, works with NHS sites or has use of a/some NHS
            facilities
          </Label>

          {showNhsRelated && (
            <>
              <Label htmlFor="nhsEngland" className={styles["checkbox-label"]}>
                <input type="checkbox" id="nhsEngland" {...register("involvesNhsEngland")} />
                NHS England will be involved in gatekeeping and/or providing data for this research
              </Label>
              {showNhsEnglandRef && (
                <Label htmlFor="nhsEnglandRef">
                  NHSE{" "}
                  <a href="https://digital.nhs.uk/services/data-access-request-service-dars#:~:text=When%20you%20start%20the%20application%20process%20you%20will%20be%20assigned%20a%20NIC%20number.">
                    DARS NIC number
                  </a>{" "}
                  (if applicable)
                  <Input type="number" id="nhsEnglandRef" {...register("nhsEnglandReference")} />
                </Label>
              )}

              <Label htmlFor="mnca" className={styles["checkbox-label"]}>
                <input type="checkbox" id="mnca" {...register("involvesMnca")} />{" "}
                <span>
                  The{" "}
                  <a href="https://www.myresearchproject.org.uk/help/hlptemplatesfor.aspx">
                    HRA Model Non-Commercial Agreement
                  </a>{" "}
                  will be in place across all sites when working with NHS sites
                </span>
              </Label>

              <Label htmlFor="dspt" className={styles["checkbox-label"]}>
                <input type="checkbox" id="dspt" {...register("requiresDspt")} />
                This research requires an NHS Data Security & Protection Toolkit registration to be in place at UCL.
                (This might arise when approaching public bodies for NHS and social care data)
              </Label>
            </>
          )}
        </fieldset>

        {/* third step */}
        <fieldset className={getFieldsetClass(3)}>
          <legend>Data</legend>

          <Label htmlFor="dbs" className={styles["checkbox-label"]}>
            <input type="checkbox" id="dbs" {...register("requiresDbs")} />
            There is data related to this research only to be handled by staff who have obtained a Disclosure and
            Barring Service (DBS) check
          </Label>

          <Label htmlFor="dataProtection" className={styles["checkbox-label"]}>
            <input type="checkbox" id="dataProtection" {...register("isDataProtectionOfficeRegistered")} />
            The research is already registered with the UCL Data Protection Office
          </Label>

          {showDataProtectionNumber && (
            <Label htmlFor="dataProtectionNumber">
              Data Protection Registration Number*:
              <HelperText>
                This is comprised of a registry ID, the year and month the data was registered and a 2-3 digit number.
                Eg. {UclDpoId}/2022/01/123
              </HelperText>
              <div className={styles["data-protection-wrapper"]}>
                <Controller
                  name="dataProtectionPrefix"
                  control={control}
                  rules={{
                    required: showDataProtectionNumber ? "Registry ID is required" : false,
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      id="dataProtectionPrefix"
                      readOnly={controllerValue?.toLowerCase() === "ucl"}
                      placeholder={controllerValue?.toLowerCase() === "ucl" ? "" : "Registry ID eg ZX1234"}
                      inputClassName={controllerValue?.toLowerCase() === "ucl" ? styles.readonly : ""}
                    />
                  )}
                />

                <Controller
                  name="dataProtectionDate"
                  control={control}
                  rules={{
                    required: showDataProtectionNumber ? "Registration date is required" : false,
                  }}
                  render={({ field }) => <input {...field} type="month" id="dataProtectionDate" />}
                />
                <Controller
                  name="dataProtectionId"
                  control={control}
                  rules={{
                    required: showDataProtectionNumber ? "Registration number is required" : false,
                    min: {
                      value: 0,
                      message: "Cannot be a negative number",
                    },
                    max: {
                      value: 999,
                      message: "Cannot be more than 3 digits",
                    },
                  }}
                  render={({ field }) => (
                    <input {...field} type="number" id="dataProtectionId" placeholder="eg 123" value={field.value} />
                  )}
                />
              </div>
              {(errors.dataProtectionPrefix || errors.dataProtectionDate || errors.dataProtectionId) && (
                <Alert type="error">
                  <AlertMessage>
                    {errors.dataProtectionPrefix?.message ||
                      errors.dataProtectionDate?.message ||
                      errors.dataProtectionId?.message}
                  </AlertMessage>
                </Alert>
              )}
            </Label>
          )}

          <Label htmlFor="thirdParty" className={styles["checkbox-label"]}>
            <input type="checkbox" id="thirdParty" {...register("involvesThirdParty")} />
            Organisations or businesses other than UCL will be involved in creating, storing, modifying, gatekeeping or
            providing data for this research
          </Label>
          <Label htmlFor="externalUsers" className={styles["checkbox-label"]}>
            <input type="checkbox" id="externalUsers" {...register("involvesExternalUsers")} />
            We plan to give access to someone who is not a member of UCL
          </Label>

          <Label htmlFor="consent" className={styles["checkbox-label"]}>
            <input type="checkbox" id="consent" {...register("involvesParticipantConsent")} />
            We will be seeking/have sought consent from participants to collect data about them for this research
          </Label>
          <Label htmlFor="indirectDataCollection" className={styles["checkbox-label"]}>
            <input type="checkbox" id="indirectDataCollection" {...register("involvesIndirectDataCollection")} />
            There is data to be collected indirectly for this research, e.g. by another organisation
          </Label>
          <Label htmlFor="extEea" className={styles["checkbox-label"]}>
            <input type="checkbox" id="extEea" {...register("involvesDataProcessingOutsideEea")} />
            There is data related to this research to be processed outside of the UK and the countries that form the
            European Economic Area (For GDPR purposes)
          </Label>
        </fieldset>

        {stepValidationError && (
          <Alert type="error">
            <AlertMessage>{stepValidationError}</AlertMessage>
          </Alert>
        )}

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
