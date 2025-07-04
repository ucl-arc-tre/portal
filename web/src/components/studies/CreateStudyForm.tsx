import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import styles from "./CreateStudyForm.module.css";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";

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
    formState: { errors },
  } = useForm<CreateStudyValues>();

  const ownerValue = useWatch({
    name: "owner",
    control,
  });
  const ownerIsUser = ownerValue === username;
  const showCagRef = useWatch({
    name: "cag",
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
        <fieldset className={styles.fieldset}>
          <legend>Study Name</legend>
          <label htmlFor="shortStudyName">
            Short Study Name*:
            <input type="text" id="shortStudyName" {...register("shortStudyName", { required: true, maxLength: 55 })} />
            {errors.shortStudyName && <span>This field is required</span>}
          </label>

          <label htmlFor="longStudyName">
            Long Study Name:
            <textarea id="longStudyName" {...register("longStudyName", { maxLength: 255 })} />
          </label>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend>Ownership</legend>
          <label htmlFor="owner">
            Study Owner (PI)*:
            <input type="email" id="owner" {...register("owner", { required: true })} />
            <small>
              <strong>Must</strong> be a full UCL staff member, not honorary or affiliated.
            </small>
          </label>

          {/* if owner is user then allow, otherwise this should be disabled */}
          <label htmlFor="admin">
            Study Administrator:
            <input type="email" id="admin" {...register("admin")} disabled={!ownerIsUser} />
          </label>

          <label htmlFor="controller">
            Data Controller (organisation)*:
            <input type="text" id="controller" {...register("controller", { required: true })} />
          </label>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend>Sponsorship & Approvals</legend>
          <label htmlFor="uclSponsorship">
            We will be seeking/have sought{" "}
            <a href="https://www.ucl.ac.uk/joint-research-office/new-studies/sponsorship-and-grant-submissions">
              UCL sponsorship
            </a>{" "}
            of this research.
            <input type="checkbox" id="uclSponsorship" {...register("uclSponsorship")} />
          </label>
          <label htmlFor="cag">
            We will be seeking/have sought approval from the{" "}
            <a href="https://www.hra.nhs.uk/about-us/committees-and-services/confidentiality-advisory-group/">
              Confidentiality Advisory Group
            </a>{" "}
            for this research.
            <input type="checkbox" id="cag" {...register("cag")} />
          </label>
          {showCagRef && (
            <label htmlFor="cagRef">
              Confidentiality Advisory Group Reference
              <input type="text" id="cagRef" {...register("cagRef")} />
            </label>
          )}

          <label htmlFor="ethics">
            We will be seeking/have sought Research Ethics Committee approval for this research
            <input type="checkbox" id="ethics" {...register("ethics")} />
          </label>

          <label htmlFor="hra">
            We will be seeking/have sought{" "}
            <a href="https://www.hra.nhs.uk/approvals-amendments/what-approvals-do-i-need/hra-approval/">
              Health Research Authority
            </a>{" "}
            approval of this research
            <input type="checkbox" id="hra" {...register("hra")} />
          </label>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend>Data</legend>

          <fieldset className={styles.fieldset}>
            <legend>Data Security</legend>
            <label htmlFor="secureData">
              There is a current need to secure data in this research; it is being/has been collected already.
              <input type="checkbox" id="secureData" {...register("secureData")} />
            </label>
            <label htmlFor="redcap">
              We intend to use the UCL REDCap instance which is installed in the Data Safe Haven (note this is{" "}
              <strong>different</strong> to the UCL REDCap used for low-risk data).
              <input type="checkbox" id="redcap" {...register("redcap")} />
            </label>
            <label htmlFor="tre">
              We are interested in using the new UCL Advanced Research Computing Trusted Research Environment (ARC TRE)
              for this research. <br />
              We are aware that if we do <strong>not</strong> check this box and require a trusted research environment
              we will be directed to the UCL Data Safe Haven.
              <input type="checkbox" id="tre" {...register("tre")} />
            </label>
          </fieldset>

          <label htmlFor="dbs">
            There is data related to this research only to be handled by staff who have obtained a Disclosure and
            Barring Service (DBS) check.
            <input type="checkbox" id="dbs" {...register("dbs")} />
          </label>

          <label htmlFor="dataProtection">
            The research already registered with UCL Data Protection
            <input type="checkbox" id="dataProtection" {...register("dataProtection")} />
          </label>
          {showDataProtectionNumber && (
            <label htmlFor="dataProtectionNumber">
              Data Protection Registration Number:
              <input type="number" id="dataProtectionNumber" {...register("dataProtectionNumber")} />
            </label>
          )}
          <label htmlFor="thirdParty">
            Organisations or businesses other than UCL will be involved in creating, storing, modifying, gatekeeping or
            providing data for this research.
            <input type="checkbox" id="thirdParty" {...register("thirdParty")} />
          </label>
          <label htmlFor="externalUsers">
            We plan to give access to someone who is not a member of UCL.
            <input type="checkbox" id="externalUsers" {...register("externalUsers")} />
          </label>

          <label htmlFor="consent">
            We will be seeking/have sought consent from participants to collect data about them for this research.
            <input type="checkbox" id="consent" {...register("consent")} />
          </label>
          <label htmlFor="nonConsent">
            There is data to be collected indirectly for this research, e.g. by another organisation.
            <input type="checkbox" id="nonConsent" {...register("nonConsent")} />
          </label>
          <label htmlFor="extEea">
            There is data related to this research to be processed outside of the UK and the countries that form the
            European Economic Area (For GDPR purposes)
            <input type="checkbox" id="extEea" {...register("extEea")} />
          </label>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend>NHS</legend>

          <label htmlFor="nhs">
            This research is associated with the NHS, uses NHS data, works with NHS sites or has use of a/some NHS
            facilities
            <input type="checkbox" id="nhs" {...register("nhs")} />
          </label>
          {showNhsRelated && (
            <>
              <label htmlFor="nhsEngland">
                NHS England will be involved in gatekeeping and/or providing data for this research.
                <input type="checkbox" id="nhsEngland" {...register("nhsEngland")} />
              </label>
              {showNhsEnglandRef && (
                <label htmlFor="nhsEnglandRef">
                  NHS England NIC number (if applicable)
                  <input type="number" id="nhsEnglandRef" {...register("nhsEnglandRef")} />
                </label>
              )}

              <label htmlFor="mnca">
                The{" "}
                <a href="https://www.myresearchproject.org.uk/help/hlptemplatesfor.aspx">
                  HRA Model Non-Commercial Agreement
                </a>{" "}
                will be in place across all sites when working with NHS sites.
                <input type="checkbox" id="mnca" {...register("mnca")} />
              </label>
              <label htmlFor="dspt">
                This research requires an NHS Data Security & Protection Toolkit registration to be in place at UCL.
                (This might arise when approaching public bodies for NHS and social care data)
                <input type="checkbox" id="dspt" {...register("dspt")} />
              </label>
            </>
          )}
        </fieldset>

        <input type="hidden" name="username" value={username} />
        <Button type="submit">Submit Request</Button>
      </form>
    </Dialog>
  );
}
