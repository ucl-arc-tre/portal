import { useState } from "react";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import styles from "./CreateStudyForm.module.css";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
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
type CreateStudyProps = {
  username: string;
  setCreateStudyFormOpen: (name: boolean) => void;
};

interface CreateStudyValues {
  shortStudyName: string;
  longStudyName: string;
  owner: string;
  admin: string;
  controller: string;
  cagRef: number;
  dataProtectionNumber: number;
  nhsEnglandRef: number;
  irasId: string; // might be number, unclear
  // checkboxes
  uclSponsorship: boolean;
  cag: boolean;
  ethics: boolean;
  hra: boolean;
  secureData: boolean;
  redcap: boolean;
  tre: boolean;
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
}
export default function CreateStudyForm(CreateStudyProps: CreateStudyProps) {
  const { username, setCreateStudyFormOpen } = CreateStudyProps;
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid, isSubmitting },
  } = useForm<CreateStudyValues>({ mode: "onChange", criteriaMode: "all" });
  const [step, setStep] = useState(1);
  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

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

  const onSubmit: SubmitHandler<CreateStudyValues> = (data) => {
    console.log(data);
  };
  return (
    <Dialog setDialogOpen={setCreateStudyFormOpen} className={styles["study-dialog"]}>
      <h2>Create Study</h2>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        {step == 1 && (
          <>
            <fieldset className={styles.fieldset}>
              <legend>Study Name</legend>
              <Label htmlFor="shortStudyName">
                Short Study Name*:
                <Input
                  type="text"
                  id="shortStudyName"
                  {...register("shortStudyName", { required: true, maxLength: 55 })}
                />
                <HelperText>Maximum 55 characters, do not include any special characters</HelperText>
                {errors.shortStudyName && <span>This field is required</span>}
                {/* todo: validation for no special characters */}
              </Label>

              <Label htmlFor="longStudyName">
                Long Study Name:
                <Textarea id="longStudyName" {...register("longStudyName", { maxLength: 255 })} />
              </Label>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend>Ownership</legend>
              <Label htmlFor="owner">
                Study Owner (PI):
                <Input
                  type="email"
                  id="owner"
                  {...register("owner", { disabled: true, value: username })}
                  placeholder={username}
                />
              </Label>

              <Label htmlFor="admin">
                Study Administrator:
                <Input type="email" id="admin" {...register("admin")} />
                <HelperText>
                  {" "}
                  <strong>Must</strong> be a full UCL staff member, not honorary or affiliated.
                </HelperText>
              </Label>

              <Label htmlFor="controller">
                Data Controller (organisation)*:
                <Input type="text" id="controller" {...register("controller", { required: true })} />
              </Label>
            </fieldset>
            <Button type="button" size="small" onClick={nextStep} className={styles["button--continue"]}>
              Next &rarr;
            </Button>
          </>
        )}
        {step == 2 && (
          <>
            <fieldset className={styles.fieldset}>
              <legend>Sponsorship & Approvals</legend>
              <Label htmlFor="uclSponsorship">
                We will be seeking/have sought{" "}
                <a href="https://www.ucl.ac.uk/joint-research-office/new-studies/sponsorship-and-grant-submissions">
                  UCL sponsorship
                </a>{" "}
                of this research.
                <Input type="checkbox" id="uclSponsorship" {...register("uclSponsorship")} />
              </Label>
              <Label htmlFor="cag">
                We will be seeking/have sought approval from the{" "}
                <a href="https://www.hra.nhs.uk/about-us/committees-and-services/confidentiality-advisory-group/">
                  Confidentiality Advisory Group
                </a>{" "}
                for this research.
                <Input type="checkbox" id="cag" {...register("cag")} />
              </Label>
              {showCagRef && (
                <Label htmlFor="cagRef">
                  Confidentiality Advisory Group Reference
                  <Input type="text" id="cagRef" {...register("cagRef")} />
                </Label>
              )}

              <Label htmlFor="ethics">
                We will be seeking/have sought Research Ethics Committee approval for this research
                <Input type="checkbox" id="ethics" {...register("ethics")} />
              </Label>

              <Label htmlFor="hra">
                We will be seeking/have sought{" "}
                <a href="https://www.hra.nhs.uk/approvals-amendments/what-approvals-do-i-need/hra-approval/">
                  Health Research Authority
                </a>{" "}
                approval of this research
                <Input type="checkbox" id="hra" {...register("hra")} />
              </Label>
              {showIrasId && (
                <Label htmlFor="irasId">
                  <a href="https://www.gov.uk/guidance/clinical-trials-for-medicines-apply-for-approval-in-the-uk#:~:text=Integrated%20Research%20Application%20System%20(IRAS)">
                    IRAS
                  </a>{" "}
                  ID (if applicable)
                  <Input type="text" id="irasId" {...register("irasId")} />
                </Label>
              )}
            </fieldset>
            <fieldset className={styles.fieldset}>
              <legend>NHS</legend>

              <Label htmlFor="nhs">
                This research is associated with the NHS, uses NHS data, works with NHS sites or has use of a/some NHS
                facilities
                <Input type="checkbox" id="nhs" {...register("nhs")} />
              </Label>
              {showNhsRelated && (
                <>
                  <Label htmlFor="nhsEngland">
                    NHS England will be involved in gatekeeping and/or providing data for this research.
                    <Input type="checkbox" id="nhsEngland" {...register("nhsEngland")} />
                  </Label>
                  {showNhsEnglandRef && (
                    <Label htmlFor="nhsEnglandRef">
                      NHS England NIC number (if applicable)
                      <Input type="number" id="nhsEnglandRef" {...register("nhsEnglandRef")} />
                    </Label>
                  )}

                  <Label htmlFor="mnca">
                    The{" "}
                    <a href="https://www.myresearchproject.org.uk/help/hlptemplatesfor.aspx">
                      HRA Model Non-Commercial Agreement
                    </a>{" "}
                    will be in place across all sites when working with NHS sites.
                    <Input type="checkbox" id="mnca" {...register("mnca")} />
                  </Label>
                  <Label htmlFor="dspt">
                    This research requires an NHS Data Security & Protection Toolkit registration to be in place at UCL.
                    (This might arise when approaching public bodies for NHS and social care data)
                    <Input type="checkbox" id="dspt" {...register("dspt")} />
                  </Label>
                </>
              )}
            </fieldset>
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={prevStep}
              className={styles["button--back"]}
            >
              &larr; Back
            </Button>
            <Button type="button" size="small" onClick={nextStep} className={styles["button--continue"]}>
              Next &rarr;
            </Button>
          </>
        )}
        {step == 3 && (
          <>
            <fieldset className={styles.fieldset}>
              <legend>Data</legend>

              <Label htmlFor="dbs">
                There is data related to this research only to be handled by staff who have obtained a Disclosure and
                Barring Service (DBS) check.
                <Input type="checkbox" id="dbs" {...register("dbs")} />
              </Label>

              <Label htmlFor="dataProtection">
                The research already registered with UCL Data Protection
                <Input type="checkbox" id="dataProtection" {...register("dataProtection")} />
              </Label>
              {showDataProtectionNumber && (
                <Label htmlFor="dataProtectionNumber">
                  Data Protection Registration Number:
                  <Input type="number" id="dataProtectionNumber" {...register("dataProtectionNumber")} />
                </Label>
              )}
              <Label htmlFor="thirdParty">
                Organisations or businesses other than UCL will be involved in creating, storing, modifying, gatekeeping
                or providing data for this research.
                <Input type="checkbox" id="thirdParty" {...register("thirdParty")} />
              </Label>
              <Label htmlFor="externalUsers">
                We plan to give access to someone who is not a member of UCL.
                <Input type="checkbox" id="externalUsers" {...register("externalUsers")} />
              </Label>

              <Label htmlFor="consent">
                We will be seeking/have sought consent from participants to collect data about them for this research.
                <Input type="checkbox" id="consent" {...register("consent")} />
              </Label>
              <Label htmlFor="nonConsent">
                There is data to be collected indirectly for this research, e.g. by another organisation.
                <Input type="checkbox" id="nonConsent" {...register("nonConsent")} />
              </Label>
              <Label htmlFor="extEea">
                There is data related to this research to be processed outside of the UK and the countries that form the
                European Economic Area (For GDPR purposes)
                <Input type="checkbox" id="extEea" {...register("extEea")} />
              </Label>
            </fieldset>
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={prevStep}
              className={styles["button--back"]}
            >
              &larr; Back
            </Button>
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </>
        )}
      </form>
    </Dialog>
  );
}
