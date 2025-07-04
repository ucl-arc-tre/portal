import Dialog from "../ui/Dialog";
import styles from "./CreateStudyForm.module.css";

type CreateStudyProps = {
  username: string;
  setCreateStudyFormOpen: (name: boolean) => void;
};
export default function CreateStudyForm(CreateStudyProps: CreateStudyProps) {
  const { username, setCreateStudyFormOpen } = CreateStudyProps;
  return (
    <Dialog setDialogOpen={setCreateStudyFormOpen} className={styles["study-dialog"]}>
      <h2>Create Study</h2>
      <form className={styles.form}>
        <fieldset className={styles.fieldset}>
          <legend>Study Name</legend>
          <label htmlFor="shortStudyName">
            Short Study Name*:
            <input type="text" id="shortStudyName" name="shortStudyName" maxLength={55} required />
          </label>

          <label htmlFor="longStudyName">
            Long Study Name:
            <textarea id="longStudyName" name="longStudyName" maxLength={255} />
          </label>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend>Ownership</legend>
          <label htmlFor="owner">
            Study Owner (PI)*:
            <input type="email" id="owner" name="owner" required />
            <small>
              <strong>Must</strong> be a full UCL staff member, not honorary or affiliated.
            </small>
          </label>

          {/* if owner is user then allow, otherwise this should be disabled */}
          <label htmlFor="admin">
            Study Administrator:
            <input type="email" id="admin" name="admin" />
          </label>

          <label htmlFor="controller">
            Data Controller (organisation)*:
            <input type="text" id="controller" name="controller" required />
          </label>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend>Sponsorship & Approvals</legend>
          <label htmlFor="uclSponsorship">
            Will you be seeking/have you sought{" "}
            <a href="https://www.ucl.ac.uk/joint-research-office/new-studies/sponsorship-and-grant-submissions">
              UCL sponsorship
            </a>{" "}
            of this research?
            <input type="checkbox" id="uclSponsorship" name="uclSponsorship" />
          </label>
          <label htmlFor="cag">
            Will you be seeking/have you sought approval from the
            <a href="https://www.hra.nhs.uk/about-us/committees-and-services/confidentiality-advisory-group/">
              Confidentiality Advisory Group
            </a>{" "}
            for this research?
            <input type="checkbox" id="cag" name="cag" />
          </label>
          {/* if yes then show */}
          <label htmlFor="cagRef">
            Confidentiality Advisory Group Reference
            <input type="text" id="cagRef" name="cagRef" />
          </label>

          <label htmlFor="ethics">
            Will you be seeking/have you sought Research Ethics Committee approval for this research?
            <input type="checkbox" id="ethics" name="ethics" />
          </label>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend>Data</legend>

          <fieldset className={styles.fieldset}>
            <legend>Data Security</legend>
            <label htmlFor="secureData">
              Is there a need at present to secure data for this research? In other words, are you already collecting or
              have you already collected the data?
              <input type="checkbox" id="secureData" name="secureData" />
            </label>
            <label htmlFor="redcap">
              Do you intend to use the UCL REDCap instance which is installed in the Data Safe Haven (note this is
              different to the UCL REDCap used for low-risk data).
              <input type="checkbox" id="redcap" name="redcap" />
            </label>
            <label htmlFor="tre">
              Are you interested in using the new UCL Advanced Research Computing Trusted Research Environment (ARC TRE)
              for this research? If you do not check this box and your research requires a trusted research environment,
              you will be directed to the UCL Data Safe Haven.
              <input type="checkbox" id="tre" name="tre" />
            </label>
          </fieldset>

          <label htmlFor="dbs">
            Are data related to this research to be handled only by staff who have obtained a Disclosure and Barring
            Service (DBS) check?
            <input type="checkbox" id="dbs" name="dbs" />
          </label>

          <label htmlFor="dataProtection">
            Data Protection Registration Number:
            <input type="number" id="dataProtection" name="dataProtection" />
            <small>Applicable if the research is already registered with UCL Data Protection</small>
          </label>

          <label htmlFor="thirdParty">
            Will any organisations or businesses other than UCL be involved in creating, storing, modifying, gatekeeping
            or providing data for this research?
            <input type="checkbox" id="thirdParty" name="thirdParty" />
          </label>
          <label htmlFor="externalUsers">
            Do you plan to give access to anyone who is not a member of UCL?
            <input type="checkbox" id="externalUsers" name="externalUsers" />
          </label>

          <label htmlFor="consent">
            Will you be seeking/have you sought consent from participants to collect data about them for this research?
            <input type="checkbox" id="consent" name="consent" />
          </label>
          <label htmlFor="nonConsent">
            Are data to be collected indirectly for this research, e.g. by another organisation?
            <input type="checkbox" id="nonConsent" name="nonConsent" />
          </label>
          <label htmlFor="extEea">
            Are data related to this research to be processed outside of the UK and the countries that form the European
            Economic Area? (For GDPR purposes)
            <input type="checkbox" id="extEea" name="extEea" />
          </label>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend>NHS</legend>
          <label htmlFor="hra">
            Will you be seeking/have you sought{" "}
            <a href="https://www.hra.nhs.uk/approvals-amendments/what-approvals-do-i-need/hra-approval/">
              Health Research Authority
            </a>{" "}
            approval of this research?
            <input type="checkbox" id="hra" name="hra" />
          </label>
          <label htmlFor="nhs">
            Is this project associated with the NHS, use NHS data, work with NHS sites or have use of any of NHS
            facilities?
            <input type="checkbox" id="nhs" name="nhs" />
          </label>
          {/* if yes then show */}
          <label htmlFor="nhsEngland">
            Will NHS England be involved in gatekeeping and/or providing data for this research?
            <input type="checkbox" id="nhsEngland" name="nhsEngland" />
          </label>
          {/* if yes then show */}
          <label htmlFor="nhsEnglandRef">
            Please provide the existing NHS England NIC number if there already is one.
            <input type="number" id="nhsEnglandRef" name="nhsEnglandRef" />
          </label>

          <label htmlFor="mnca">
            Will the{" "}
            <a href="https://www.myresearchproject.org.uk/help/hlptemplatesfor.aspx">
              HRA Model Non-Commercial Agreement
            </a>{" "}
            be in place across all sites if working with NHS sites?
            <input type="checkbox" id="mnca" name="mnca" />
          </label>
          <label htmlFor="dspt">
            Does this research require an NHS Data Security & Protection Toolkit registration to be in place at UCL?
            (This might arise when approaching public bodies for NHS and social care data)
            <input type="checkbox" id="dspt" name="dspt" />
          </label>
        </fieldset>

        <input type="hidden" name="username" value={username} />
      </form>
    </Dialog>
  );
}
