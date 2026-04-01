import { Control, Controller, FieldErrors, useWatch } from "react-hook-form";
import { Alert, AlertMessage, HelperText, Label } from "../../shared/uikitExports";
import sharedStyles from "./StudyFormShared.module.css";
import styles from "./StudyFormStep2.module.css";
import YesNoUnsureButtons from "./YesNoUnsureButtons";

type StudyFormStep2Props = {
  control: Control<StudyFormData>;
  errors: FieldErrors<StudyFormData>;
};

export default function StudyFormStep2({ control, errors }: StudyFormStep2Props) {
  const showCagRef = useWatch({ name: "involvesCag", control });
  const showIrasId = useWatch({ name: "involvesHraApproval", control });
  const showNhsRelated = useWatch({ name: "isNhsAssociated", control });
  const showNhsEnglandRef = useWatch({ name: "involvesNhsEngland", control });

  return (
    <>
      <fieldset className={sharedStyles.fieldset}>
        <div className={sharedStyles["option-field"]} data-cy="involvesUclSponsorship">
          <span>
            We will be seeking/have sought{" "}
            <a
              className={sharedStyles["form-link"]}
              href="https://www.ucl.ac.uk/joint-research-office/new-studies/sponsorship-and-grant-submissions"
            >
              UCL sponsorship
            </a>{" "}
            of this research
          </span>
          <Controller
            name="involvesUclSponsorship"
            control={control}
            defaultValue={undefined}
            render={({ field }) => <YesNoUnsureButtons value={field.value} onChange={field.onChange} />}
          />
        </div>

        <div className={sharedStyles["option-field"]} data-cy="involvesCag">
          <span>
            {" "}
            We will be seeking/have sought approval from the{" "}
            <a
              className={sharedStyles["form-link"]}
              href="https://www.hra.nhs.uk/about-us/committees-and-services/confidentiality-advisory-group/"
            >
              Confidentiality Advisory Group
            </a>{" "}
            for this research
          </span>
          <Controller
            name="involvesCag"
            control={control}
            defaultValue={undefined}
            render={({ field }) => <YesNoUnsureButtons value={field.value} onChange={field.onChange} />}
          />
        </div>

        {showCagRef === true && (
          <Label htmlFor="cagRef">
            Confidentiality Advisory Group Reference (if applicable)
            <HelperText>Format: xx/CAG/xxxx eg. 45/CAG/1234</HelperText>
            <Controller
              name="cagReference"
              control={control}
              rules={{
                pattern: {
                  value: /^\d{2}\/CAG\/\d{4}$/i,
                  message: "Must follow the format provided",
                },
              }}
              render={({ field }) => (
                <input
                  {...field}
                  className={styles["option__text-input"]}
                  type="text"
                  id="cagRef"
                  placeholder="eg. 12/CAG/3456"
                  value={field.value?.toUpperCase()}
                  maxLength={11}
                />
              )}
            />
            {errors.cagReference && (
              <Alert type="error">
                <AlertMessage>{errors.cagReference.message}</AlertMessage>
              </Alert>
            )}
          </Label>
        )}

        <div className={sharedStyles["option-field"]} data-cy="involvesEthicsApproval">
          We will be seeking/have sought Research Ethics Committee approval for this research
          <Controller
            name="involvesEthicsApproval"
            control={control}
            defaultValue={undefined}
            render={({ field }) => <YesNoUnsureButtons value={field.value} onChange={field.onChange} />}
          />
        </div>

        <div className={sharedStyles["option-field"]} data-cy="involvesHraApproval">
          <span>
            We will be seeking/have sought{" "}
            <a
              className={sharedStyles["form-link"]}
              href="https://www.hra.nhs.uk/approvals-amendments/what-approvals-do-i-need/hra-approval/"
            >
              Health Research Authority
            </a>{" "}
            approval of this research
          </span>
          <Controller
            name="involvesHraApproval"
            control={control}
            defaultValue={undefined}
            render={({ field }) => <YesNoUnsureButtons value={field.value} onChange={field.onChange} />}
          />
        </div>

        {showIrasId === true && (
          <Label htmlFor="irasId">
            <span>
              {" "}
              <a
                className={sharedStyles["form-link"]}
                href="https://www.gov.uk/guidance/clinical-trials-for-medicines-apply-for-approval-in-the-uk#:~:text=Integrated%20Research%20Application%20System%20(IRAS)"
              >
                IRAS
              </a>{" "}
              ID (if applicable)
            </span>
            <HelperText>7-digit ID</HelperText>
            <Controller
              name="irasId"
              control={control}
              rules={{
                pattern: {
                  value: /\d/,
                  message: "Digits only",
                },
              }}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  id="irasId"
                  className={styles["option__text-input"]}
                  maxLength={7}
                  placeholder="eg. 1234567"
                />
              )}
            />
            {errors.irasId && (
              <Alert type="error">
                <AlertMessage>{errors.irasId.message}</AlertMessage>
              </Alert>
            )}
          </Label>
        )}
      </fieldset>

      <fieldset className={sharedStyles.fieldset}>
        <div className={sharedStyles["option-field"]} data-cy="isNhsAssociated">
          This research is associated with the NHS, uses NHS data, works with NHS sites or has use of a/some NHS
          facilities
          <Controller
            name="isNhsAssociated"
            control={control}
            defaultValue={undefined}
            render={({ field }) => <YesNoUnsureButtons value={field.value} onChange={field.onChange} />}
          />
        </div>

        {showNhsRelated === true && (
          <>
            <div className={sharedStyles["option-field"]} data-cy="involvesNhsEngland">
              NHS England will be involved in gatekeeping and/or providing data for this research
              <Controller
                name="involvesNhsEngland"
                control={control}
                defaultValue={undefined}
                render={({ field }) => <YesNoUnsureButtons value={field.value} onChange={field.onChange} />}
              />
            </div>
            {showNhsEnglandRef === true && (
              <Label htmlFor="nhsEnglandRef">
                NHSE{" "}
                <a
                  className={sharedStyles["form-link"]}
                  href="https://digital.nhs.uk/services/data-access-request-service-dars#:~:text=When%20you%20start%20the%20application%20process%20you%20will%20be%20assigned%20a%20NIC%20number."
                >
                  DARS NIC number
                </a>{" "}
                (if applicable)
                <HelperText>Format: DARS-NIC-XXXXXX-XXXXX-XX</HelperText>
                <div className={styles["nhse-ref"]}>
                  DARS-NIC-
                  <Controller
                    name="nhsEnglandReference"
                    control={control}
                    rules={{
                      pattern: {
                        value: /\d{6}-\d{5}-\d{2}$/,
                        message: "Must follow the format provided. You only need to insert numbers and dashes",
                      },
                    }}
                    render={({ field }) => (
                      <input
                        {...field}
                        className={styles["option__text-input"]}
                        type="text"
                        id="nhsEnglandRef"
                        placeholder="eg. 123456-12345-12"
                        value={field.value}
                        maxLength={15}
                      />
                    )}
                  />
                </div>
                {errors.nhsEnglandReference && (
                  <Alert type="error">
                    <AlertMessage>{errors.nhsEnglandReference.message}</AlertMessage>
                  </Alert>
                )}
              </Label>
            )}

            <div className={sharedStyles["option-field"]} data-cy="involvesMnca">
              <span>
                The{" "}
                <a
                  className={sharedStyles["form-link"]}
                  href="https://www.myresearchproject.org.uk/help/hlptemplatesfor.aspx"
                >
                  HRA Model Non-Commercial Agreement
                </a>{" "}
                will be in place across all sites when working with NHS sites
              </span>
              <Controller
                name="involvesMnca"
                control={control}
                defaultValue={undefined}
                render={({ field }) => <YesNoUnsureButtons value={field.value} onChange={field.onChange} />}
              />
            </div>

            <div className={sharedStyles["option-field"]} data-cy="requiresDspt">
              This research requires an NHS Data Security & Protection Toolkit registration to be in place at UCL. (This
              might arise when approaching public bodies for NHS and social care data)
              <Controller
                name="requiresDspt"
                control={control}
                defaultValue={undefined}
                render={({ field }) => <YesNoUnsureButtons value={field.value} onChange={field.onChange} />}
              />
            </div>
          </>
        )}
      </fieldset>
    </>
  );
}
