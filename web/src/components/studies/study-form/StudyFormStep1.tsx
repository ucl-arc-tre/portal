import { Control, Controller, FieldErrors, UseFormGetValues, UseFormRegister, useFieldArray } from "react-hook-form";
import { Input, Alert, AlertMessage, HelperText, Textarea, Label } from "../../shared/uikitExports";
import Button from "../../ui/Button";
import sharedStyles from "./StudyFormShared.module.css";
import styles from "./StudyFormStep1.module.css";

type StudyFormStep1Props = {
  control: Control<StudyFormData>;
  errors: FieldErrors<StudyFormData>;
  register: UseFormRegister<StudyFormData>;
  getValues: UseFormGetValues<StudyFormData>;
  username: string;
};

const domainName = process.env.NEXT_PUBLIC_DOMAIN_NAME || "@ucl.ac.uk";

export default function StudyFormStep1({ control, errors, register, getValues, username }: StudyFormStep1Props) {
  const { fields, append, remove } = useFieldArray<StudyFormData, "additionalStudyAdminUsernames", "id">({
    control,
    name: "additionalStudyAdminUsernames",
  });

  return (
    <>
      <fieldset className={sharedStyles.fieldset}>
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
            Study title must be 4-50 characters, start and end with a letter/number, only letters, numbers, spaces, and
            hyphens allowed
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
            rules={{
              pattern: {
                value: /^[\s\S]{0,255}$/,
                message: "Description must be at most 255 characters",
              },
            }}
            render={({ field }) => <Textarea {...field} id="description" />}
          />
          {errors.description && (
            <Alert type="error">
              <AlertMessage>{errors.description.message}</AlertMessage>
            </Alert>
          )}
        </Label>
      </fieldset>

      <fieldset className={sharedStyles.fieldset}>
        <Label htmlFor="owner">
          Study Owner (PI):
          <Input
            type="email"
            id="owner"
            {...register("owner")}
            readOnly={true}
            value={username}
            inputClassName={sharedStyles.readonly}
          />
          <HelperText>
            If you are not the study owner, contact the owner and ask them to fill out this form on their account.
          </HelperText>
        </Label>

        <Label>
          Additional Study Administrators (optional):
          <fieldset className={sharedStyles.fieldset}>
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
                      validate: {
                        isNotEmpty: (value) => {
                          if (!value || value.replace(domainName, "").trim() === "") {
                            return "Username is required";
                          }
                          return true;
                        },
                        notEmailPart: (value) => {
                          if (value.replace(domainName, "").includes("@")) {
                            return `Enter only the username part (without ${domainName})`;
                          }
                          return true;
                        },
                        isUnique: (value) => {
                          const allAdminUsernames = getValues(`additionalStudyAdminUsernames`).map(
                            (admin) => admin.value
                          );
                          const duplicateCount = allAdminUsernames.filter((username) => username === value).length;
                          return duplicateCount <= 1 || "Username has already been entered";
                        },
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <div className={styles["username-input-wrapper"]}>
                        <div>
                          <Input
                            value={field.value?.replace(domainName, "") ?? ""}
                            onChange={(e) => field.onChange(`${e.target.value}${domainName}`)}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                            type="text"
                            id={`admin-${index}`}
                            placeholder="Valid UCL username"
                          />
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

                <Button type="button" onClick={() => remove(index)} size="small" data-cy="remove-study-admin-button">
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
              data-cy="add-study-admin-button"
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
    </>
  );
}
