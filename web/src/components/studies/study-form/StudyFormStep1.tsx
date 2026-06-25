import { Control, Controller, FieldErrors, UseFormRegister, useFieldArray } from "react-hook-form";
import { Input, Alert, AlertMessage, HelperText, Textarea, Label } from "../../shared/uikitExports";
import sharedStyles from "./StudyFormShared.module.css";
import UserLookup from "@/components/shared/UserLookup";

type StudyFormStep1Props = {
  control: Control<StudyFormData>;
  errors: FieldErrors<StudyFormData>;
  register: UseFormRegister<StudyFormData>;
  username: string;
};

export default function StudyFormStep1({ control, errors, register, username }: StudyFormStep1Props) {
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
                value: /^\w[\w\s\-']{2,48}\w$/,
                message:
                  "Study title must be 4-50 characters, start and end with a letter/number, and contain only letters, numbers, spaces, hyphens and apostrophes",
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
          Study Description*:
          <Controller
            name="description"
            control={control}
            rules={{
              required: "This field is required",
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

        <Label htmlFor="lookup">
          Additional Study Administrator (optional):
          <fieldset className={sharedStyles.fieldset}>
            <HelperText style={{ marginBottom: "1rem" }}>
              Add a UCL staff member who will help administrate this study. <strong>Must</strong> be valid UCL staff.
            </HelperText>
            <UserLookup
              filterByApprovedResearchers={true}
              usernames={fields}
              appendUsername={(value: string) => append({ value })}
              removeUsername={(username: string) => {
                const index = fields.findIndex((field) => field.value === username);
                if (index !== -1) remove(index);
              }}
            />
            {errors.additionalStudyAdminUsernames && (
              <Alert type="error">
                <AlertMessage>{errors.additionalStudyAdminUsernames.message}</AlertMessage>
              </Alert>
            )}
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
