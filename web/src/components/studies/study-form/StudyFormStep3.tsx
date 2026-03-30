import { Control, Controller, FieldErrors, useWatch } from "react-hook-form";
import { Alert, AlertMessage, HelperText, Label } from "../../shared/uikitExports";
import styles from "./StudyForm.module.css";
import { UclDpoId } from "./studyFormUtils";
import YesNoUnsureButtons from "./YesNoUnsureButtons";

type StudyFormStep3Props = {
  control: Control<StudyFormData>;
  errors: FieldErrors<StudyFormData>;
  controllerValue: string;
  className: string;
};

export default function StudyFormStep3({ control, errors, controllerValue, className }: StudyFormStep3Props) {
  const showDataProtectionNumber = useWatch({ name: "isDataProtectionOfficeRegistered", control });

  return (
    <fieldset className={className}>
      <div className={styles["option-field"]} data-cy="requiresDbs">
        There is data related to this research only to be handled by staff who have obtained a Disclosure and Barring
        Service (DBS) check
        <Controller
          name="requiresDbs"
          control={control}
          defaultValue={undefined}
          render={({ field }) => <YesNoUnsureButtons value={field.value} onChange={field.onChange} />}
        />
      </div>

      <div className={styles["option-field"]} data-cy="isDataProtectionOfficeRegistered">
        The research is already registered with the UCL Data Protection Office
        <Controller
          name="isDataProtectionOfficeRegistered"
          control={control}
          defaultValue={undefined}
          render={({ field }) => <YesNoUnsureButtons value={field.value} onChange={field.onChange} />}
        />
      </div>

      {showDataProtectionNumber === true && (
        <Label htmlFor="dataProtectionNumber">
          Data Protection Registration Number*:
          <HelperText>
            This is comprised of a registry ID, the year and month the data was registered and a 2-3 digit number. Eg.{" "}
            {UclDpoId}/2022/01/123
          </HelperText>
          <div className={styles["data-protection-wrapper"]}>
            <Controller
              name="dataProtectionPrefix"
              control={control}
              rules={{
                required: showDataProtectionNumber ? "Registry ID is required" : false,
              }}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  id="dataProtectionPrefix"
                  readOnly={controllerValue?.toLowerCase() === "ucl"}
                  placeholder={controllerValue?.toLowerCase() === "ucl" ? "" : "Registry ID eg ZX1234"}
                  className={controllerValue?.toLowerCase() === "ucl" ? styles.readonly : ""}
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
                pattern: {
                  value: /^(?:(?:0[1-9])|(?:[1-9]\d{1,2}))$/,
                  message:
                    "Must be 2 or 3 digits. Values below 10 should be prefixed with a 0. Values above must not have a 0 prefix.",
                },
              }}
              render={({ field }) => (
                <input {...field} type="text" id="dataProtectionId" placeholder="eg 123" value={field.value} />
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

      <div className={styles["option-field"]} data-cy="involvesThirdParty">
        Organisations or businesses other than UCL will be involved in creating, storing, modifying, gatekeeping or
        providing data for this research
        <Controller
          name="involvesThirdParty"
          control={control}
          defaultValue={undefined}
          render={({ field }) => <YesNoUnsureButtons value={field.value} onChange={field.onChange} />}
        />
      </div>
      <div className={styles["option-field"]} data-cy="involvesExternalUsers">
        We plan to give access to someone who is not a member of UCL
        <Controller
          name="involvesExternalUsers"
          control={control}
          defaultValue={undefined}
          render={({ field }) => <YesNoUnsureButtons value={field.value} onChange={field.onChange} />}
        />
      </div>

      <div className={styles["option-field"]} data-cy="involvesParticipantConsent">
        We will be seeking/have sought consent from participants to collect data about them for this research
        <Controller
          name="involvesParticipantConsent"
          control={control}
          defaultValue={undefined}
          render={({ field }) => <YesNoUnsureButtons value={field.value} onChange={field.onChange} />}
        />
      </div>
      <div className={styles["option-field"]} data-cy="involvesIndirectDataCollection">
        There is data to be collected indirectly for this research, e.g. by another organisation
        <Controller
          name="involvesIndirectDataCollection"
          control={control}
          defaultValue={undefined}
          render={({ field }) => <YesNoUnsureButtons value={field.value} onChange={field.onChange} />}
        />
      </div>
      <div className={styles["option-field"]} data-cy="involvesDataProcessingOutsideEea">
        There is data related to this research to be processed outside of the UK and the countries that form the
        European Economic Area (For GDPR purposes)
        <Controller
          name="involvesDataProcessingOutsideEea"
          control={control}
          defaultValue={undefined}
          render={({ field }) => <YesNoUnsureButtons value={field.value} onChange={field.onChange} />}
        />
      </div>
    </fieldset>
  );
}
