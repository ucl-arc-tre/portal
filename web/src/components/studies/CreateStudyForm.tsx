import { useState } from "react";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import styles from "./CreateStudyForm.module.css";
import { Controller, SubmitHandler, useForm, useWatch } from "react-hook-form";
import dynamic from "next/dynamic";

const Label = dynamic(() => import("uikit-react-public").then((mod) => mod.Label), {
  ssr: false,
});
const Input = dynamic(() => import("uikit-react-public").then((mod) => mod.Input), {
  ssr: false,
});
const Textarea = dynamic(() => import("uikit-react-public").then((mod) => mod.Textarea), {
  ssr: false,
});
const HelperText = dynamic(() => import("uikit-react-public").then((mod) => mod.Field.HelperText), {
  ssr: false,
});
const Alert = dynamic(() => import("uikit-react-public").then((mod) => mod.Alert), {
  ssr: false,
});
const AlertMessage = dynamic(() => import("uikit-react-public").then((mod) => mod.Alert.Message), {
  ssr: false,
});

type CreateStudyProps = {
  username: string;
  setCreateStudyFormOpen: (name: boolean) => void;
};

type CreateStudyValues = {
  studyName: string;
  studyDescription: string;
  owner: string;
  admin: string;
  controller: string;
  controllerOther: string;
  cagRef: number;
  dataProtectionPrefix: string;
  dataProtectionDate: string;
  dataProtectionId: number;
  dataProtectionNumber: string; // prefix/date/id
  nhsEnglandRef: number;
  irasId: string; // might be number, unclear
  // checkboxes
  uclSponsorship: boolean;
  cag: boolean;
  ethics: boolean;
  hra: boolean;
  dbs: boolean;
  dataProtection: boolean;
  thirdParty: boolean;
  externalUsers: boolean;
  consent: boolean;
  nonConsent: boolean;
  extEea: boolean;
  nhs: boolean;
  nhsEngland: boolean;
  mnca: boolean;
  dspt: boolean;
};

const UclDpoId = "Z6364106";

export default function CreateStudyForm(CreateStudyProps: CreateStudyProps) {
  const { username, setCreateStudyFormOpen } = CreateStudyProps;
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid, isSubmitting },
  } = useForm<CreateStudyValues>({
    mode: "onChange",
    criteriaMode: "all",
    defaultValues: {
      owner: username,
      dataProtectionPrefix: UclDpoId,
    },
  });
  const [currentStep, setCurrentStep] = useState(1);
  const nextStep = () => setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);
  const totalSteps = 3;

  const showCagRef = useWatch({
    name: "cag",
    control,
  });
  const showIrasId = useWatch({
    name: "hra",
    control,
  });
  const showDataProtectionNumber = useWatch({
    name: "dataProtection",
    control,
  });
  const showNhsRelated = useWatch({
    name: "nhs",
    control,
  });
  const showNhsEnglandRef = useWatch({
    name: "nhsEngland",
    control,
  });
  const controllerValue = useWatch({
    name: "controller",
    control,
  });

  const onSubmit: SubmitHandler<CreateStudyValues> = (data) => {
    console.log(data);
    // set the dataProtectionNumber
    //TODO: may need to change - to / from the date
    const updatedData = {
      ...data,
      dataProtectionNumber: `${data.dataProtectionPrefix}/${data.dataProtectionDate}/${data.dataProtectionId}`,
    };
    console.log(updatedData);
    //todo: do the things
  };
  const getFieldsetClass = (step: number) =>
    `${styles.fieldset} ${currentStep === step ? styles.visible : styles.hidden}`;

  return (
    <Dialog setDialogOpen={setCreateStudyFormOpen} className={styles["study-dialog"]} cy="create-study-form">
      <h2>Create Study</h2>
      <div className={styles["step-progress"]}>
        <div
          className={`${styles["step-dot"]} ${currentStep === 1 ? styles["active"] : ""} ${isValid ? styles.valid : ""}`}
        ></div>
        <div
          className={`${styles["step-dot"]} ${currentStep === 2 ? styles["active"] : ""}${isValid ? styles.valid : ""}`}
        ></div>
        <div className={`${styles["step-dot"]} ${currentStep === 3 ? styles["active"] : ""}`}></div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        {/* first step */}
        <fieldset className={getFieldsetClass(1)}>
          <legend>Study Details</legend>
          <Label htmlFor="studyName">
            Study Name*:
            <Controller
              name="studyName"
              control={control}
              rules={{
                required: "This field is required",
                maxLength: {
                  value: 55,
                  message: "Maximum 55 characters",
                },
                pattern: {
                  value: /^[a-zA-Z0-9 ]+$/,
                  message: "Do not include any special characters",
                },
              }}
              render={({ field }) => <Input {...field} type="text" id="studyName" />}
            />
            <HelperText>Maximum 55 characters, do not include any special characters</HelperText>
            {errors.studyName && (
              <Alert type="error">
                <AlertMessage>{errors.studyName.message}</AlertMessage>
              </Alert>
            )}
          </Label>

          <Label htmlFor="studyDescription">
            Study Description:
            <Textarea id="studyDescription" {...register("studyDescription", { maxLength: 255 })} />
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

          <Label htmlFor="admin">
            Study Administrator:
            <Controller
              name="admin"
              control={control}
              rules={{
                pattern: {
                  value: /@ucl\.ac\.uk$/,
                  message: "Email must be a UCL email address",
                },
              }}
              render={({ field }) => <Input {...field} type="email" id="admin" placeholder="ccbcabc@ucl.ac.uk" />}
            />
            {errors.admin && (
              <Alert type="error">
                <AlertMessage>{errors.admin.message}</AlertMessage>
              </Alert>
            )}
            <HelperText>
              {" "}
              <strong>Must</strong> be a full UCL staff member, not honorary or affiliated
            </HelperText>
          </Label>

          <Label htmlFor="controller">
            Data Controller (organisation)*:
            <Controller
              name="controller"
              control={control}
              rules={{ required: "This field is required" }}
              render={({ field }) => (
                <select {...field} id={styles.controller}>
                  <option value="UCL">UCL</option>
                  <option value="Other">Other</option>
                </select>
              )}
            />
            {controllerValue === "Other" && (
              <Controller
                name="controllerOther"
                control={control}
                rules={{ required: "This field is required" }}
                render={({ field }) => <Input {...field} type="text" id="controllerOther" />}
              />
            )}
            {(errors.controller || errors.controllerOther) && (
              <Alert type="error">
                <AlertMessage>{errors.controller?.message || errors.controllerOther?.message}</AlertMessage>
              </Alert>
            )}
          </Label>
        </fieldset>

        {/* second step */}
        <fieldset className={getFieldsetClass(2)}>
          <legend>Sponsorship & Approvals</legend>
          <Label htmlFor="uclSponsorship" className={styles["checkbox-label"]}>
            <input type="checkbox" id="uclSponsorship" {...register("uclSponsorship")} />{" "}
            <span>
              We will be seeking/have sought{" "}
              <a href="https://www.ucl.ac.uk/joint-research-office/new-studies/sponsorship-and-grant-submissions">
                UCL sponsorship
              </a>{" "}
              of this research
            </span>
          </Label>
          <Label htmlFor="cag" className={styles["checkbox-label"]}>
            <input type="checkbox" id="cag" {...register("cag")} />
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
              <Input type="text" id="cagRef" {...register("cagRef")} />
            </Label>
          )}

          <Label htmlFor="ethics" className={styles["checkbox-label"]}>
            <input type="checkbox" id="ethics" {...register("ethics")} />
            We will be seeking/have sought Research Ethics Committee approval for this research
          </Label>

          <Label htmlFor="hra" className={styles["checkbox-label"]}>
            <input type="checkbox" id="hra" {...register("hra")} />{" "}
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
            <input type="checkbox" id="nhs" {...register("nhs")} />
            This research is associated with the NHS, uses NHS data, works with NHS sites or has use of a/some NHS
            facilities
          </Label>
          {showNhsRelated && (
            <>
              <Label htmlFor="nhsEngland" className={styles["checkbox-label"]}>
                <input type="checkbox" id="nhsEngland" {...register("nhsEngland")} />
                NHS England will be involved in gatekeeping and/or providing data for this research
              </Label>
              {showNhsEnglandRef && (
                <Label htmlFor="nhsEnglandRef">
                  NHS England NIC number (if applicable)
                  <Input type="number" id="nhsEnglandRef" {...register("nhsEnglandRef")} />
                </Label>
              )}

              <Label htmlFor="mnca" className={styles["checkbox-label"]}>
                <input type="checkbox" id="mnca" {...register("mnca")} />{" "}
                <span>
                  The{" "}
                  <a href="https://www.myresearchproject.org.uk/help/hlptemplatesfor.aspx">
                    HRA Model Non-Commercial Agreement
                  </a>{" "}
                  will be in place across all sites when working with NHS sites
                </span>
              </Label>
              <Label htmlFor="dspt" className={styles["checkbox-label"]}>
                <input type="checkbox" id="dspt" {...register("dspt")} />
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
            <input type="checkbox" id="dbs" {...register("dbs")} />
            There is data related to this research only to be handled by staff who have obtained a Disclosure and
            Barring Service (DBS) check
          </Label>

          <Label htmlFor="dataProtection" className={styles["checkbox-label"]}>
            <input type="checkbox" id="dataProtection" {...register("dataProtection")} />
            The research is already registered with the UCL Data Protection Office
          </Label>
          {showDataProtectionNumber && (
            <Label htmlFor="dataProtectionNumber">
              Data Protection Registration Number:
              <HelperText>
                This is comprised of a registry ID, the year and month the data was registered and a 2-3 digit number.
                Eg. {UclDpoId}/2022/01/123
              </HelperText>
              <div className={styles["data-protection-wrapper"]}>
                <Input
                  type="text"
                  id="dataProtectionPrefix"
                  {...register("dataProtectionPrefix")}
                  readOnly={true}
                  value={UclDpoId}
                  inputClassName={styles.readonly}
                />
                <Input type="month" id="dataProtectionDate" {...register("dataProtectionDate")} />
                <Input
                  type="number"
                  id="dataProtectionId"
                  {...register("dataProtectionId", {
                    min: {
                      value: 0,
                      message: "Cannot be a negative number",
                    },
                    max: {
                      value: 999,
                      message: "Cannot be more than 3 digits",
                    },
                  })}
                />
              </div>
              {(errors.dataProtectionDate || errors.dataProtectionId) && (
                <Alert type="error">
                  <AlertMessage>
                    {errors.dataProtectionNumber?.message || errors.dataProtectionId?.message}
                  </AlertMessage>
                </Alert>
              )}
            </Label>
          )}
          <Label htmlFor="thirdParty" className={styles["checkbox-label"]}>
            <input type="checkbox" id="thirdParty" {...register("thirdParty")} />
            Organisations or businesses other than UCL will be involved in creating, storing, modifying, gatekeeping or
            providing data for this research
          </Label>
          <Label htmlFor="externalUsers" className={styles["checkbox-label"]}>
            <input type="checkbox" id="externalUsers" {...register("externalUsers")} />
            We plan to give access to someone who is not a member of UCL
          </Label>

          <Label htmlFor="consent" className={styles["checkbox-label"]}>
            <input type="checkbox" id="consent" {...register("consent")} />
            We will be seeking/have sought consent from participants to collect data about them for this research
          </Label>
          <Label htmlFor="nonConsent" className={styles["checkbox-label"]}>
            <input type="checkbox" id="nonConsent" {...register("nonConsent")} />
            There is data to be collected indirectly for this research, e.g. by another organisation
          </Label>
          <Label htmlFor="extEea" className={styles["checkbox-label"]}>
            <input type="checkbox" id="extEea" {...register("extEea")} />
            There is data related to this research to be processed outside of the UK and the countries that form the
            European Economic Area (For GDPR purposes)
          </Label>
        </fieldset>

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
          <Button type="button" size="small" onClick={nextStep} className={styles["button--continue"]} cy="next">
            Next &rarr;
          </Button>
        )}
        {currentStep === totalSteps && (
          <>
            {!isValid && (
              <HelperText className={styles["form-helper--invalid"]}>Please fill out all required fields</HelperText>
            )}
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </>
        )}
      </form>
    </Dialog>
  );
}
