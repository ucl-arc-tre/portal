import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import InfoTooltip from "../../ui/InfoTooltip";
import { HelperText, Alert, AlertMessage, Label } from "../../shared/uikitExports";
import { ProjectFormData } from "@/types/projects";
import { ProjectTreRoleName } from "@/openapi";
import styles from "./ProjectFormTRE.module.css";
import RadioOptions from "@/components/ui/form/RadioOptions";
import { Role, roles } from "./roles";
import UserLookup from "@/components/shared/UserLookup";

type Props = {
  fieldsDisabled: boolean;
};

export default function ProjectFormTREStep(props: Props) {
  const { fieldsDisabled } = props;
  const {
    watch,
    control,
    getValues,
    setValue,
    register,
    formState: { errors },
  } = useFormContext<ProjectFormData>();

  const {
    fields: researcherFields,
    append: appendResearcher,
    remove: removeResearcher,
  } = useFieldArray({
    control,
    name: "members",
  });

  const rolesMap = Object.entries(roles) as [ProjectTreRoleName, Role][];

  const numRequiredEgressApprovals = watch("tre.numRequiredEgressApprovals");
  const members = watch("members");
  const numEgressCheckers = members.filter((member) => member.roles.includes("egress_checker")).length;

  return (
    <>
      <div className="field">
        <Label htmlFor="members">Project users (optional):*</Label>
        <fieldset className="linkage-fieldset">
          <UserLookup
            filterByApprovedResearchers={false}
            usernames={members}
            appendUsername={(value: string) => appendResearcher({ username: value, roles: [] })}
            removeUsername={(username: string) => {
              const index = researcherFields.findIndex((field) => field.username === username);
              if (index !== -1) removeResearcher(index);
            }}
            roleControl={(user) => {
              const memberIndex = members.findIndex((member) => member.username === user.user.username);
              const researcher = members[memberIndex];
              const availableRolesToAdd = rolesMap.filter(([roleName]) => !researcher?.roles?.includes(roleName));

              return (
                <Controller
                  name={`members.${memberIndex}.roles` as const}
                  control={control}
                  rules={{
                    validate: {
                      hasAtLeastOneRole: (value) => {
                        if (!value || value.length === 0) {
                          return "At least one role is required";
                        }
                        return true;
                      },
                    },
                  }}
                  render={({ fieldState }) => (
                    <div className={styles.roles}>
                      {researcher?.roles && researcher.roles.length > 0 && (
                        <div className={styles["role-tags"]}>
                          {researcher.roles.map((role) => (
                            <span key={role} className={styles["role-tag"]}>
                              {roles[role as ProjectTreRoleName].label}
                              <span className={styles["role-tooltip"]}>
                                <InfoTooltip text={roles[role as ProjectTreRoleName].description} />
                              </span>
                              <button
                                type="button"
                                className={styles["role-tag-remove"]}
                                onClick={() => {
                                  const currentRoles = getValues(`members.${memberIndex}.roles`);
                                  setValue(
                                    `members.${memberIndex}.roles`,
                                    currentRoles.filter((chosenRole) => chosenRole !== role),
                                    { shouldValidate: true }
                                  );
                                }}
                                aria-label={`Remove ${role} role`}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      {availableRolesToAdd.length > 0 && (
                        <select
                          className={styles["role-dropdown"]}
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              const currentRoles = getValues(`members.${memberIndex}.roles`) || [];
                              setValue(
                                `members.${memberIndex}.roles`,
                                [...currentRoles, e.target.value as ProjectTreRoleName],
                                { shouldValidate: true }
                              );
                            }
                          }}
                          disabled={fieldsDisabled}
                        >
                          <option value="">+ Add role...</option>
                          {availableRolesToAdd.map(([roleName, role]) => (
                            <option key={roleName} value={roleName}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                      )}
                      {fieldState.error && (
                        <Alert type="error">
                          <AlertMessage>{fieldState.error.message}</AlertMessage>
                        </Alert>
                      )}
                    </div>
                  )}
                />
              );
            }}
          />
        </fieldset>
        <HelperText>Optionally add additional researchers with their roles to this project</HelperText>
      </div>

      <div>
        <RadioOptions
          name="tre.numRequiredEgressApprovals"
          label="Number of required approvals to egress a file *"
          options={[
            { name: "1", value: "1" },
            { name: "2", value: "2" },
            { name: "3", value: "3" },
            { name: "4", value: "4" },
          ]}
          register={register}
          error={errors.tre?.numRequiredEgressApprovals}
        />
        <HelperText>
          The TRE requires approvals on files to be egressed. Self approvals are permitted. See the{" "}
          <a href="https://docs.tre.arc.ucl.ac.uk/">documentation</a> for more information.
        </HelperText>
        {numRequiredEgressApprovals === "1" && (
          <div className={styles["num-egress-approvals-alert"]}>
            <Alert type="warning">
              <AlertMessage>
                {
                  'You have selected a single approval for a project with more than one user. This means that there will not be a "four eyes" check on the data that is being egressed. Please strongly consider adding using at least two required approvers.'
                }
              </AlertMessage>
            </Alert>
          </div>
        )}

        {numRequiredEgressApprovals && numEgressCheckers < Number(numRequiredEgressApprovals) && (
          <div className={styles["num-egress-approvals-alert"]}>
            <Alert type="warning">
              <AlertMessage>
                {`The number of users with an "egress checker" role is currently ${numEgressCheckers}, which is fewer than the required number of approvals ${numRequiredEgressApprovals}. No data will be able to be egressed from the TRE.`}
              </AlertMessage>
            </Alert>
          </div>
        )}
      </div>

      <div>
        <RadioOptions
          name="tre.externalEncryptionEnabled"
          label="Data will need be stored outside of the TRE? *"
          options={[
            { name: "Yes", value: "true" },
            { name: "No", value: "false" },
          ]}
          register={register}
          error={errors.tre?.externalEncryptionEnabled}
        />
        <HelperText>
          The TRE can be used to store data outside the environment using an external encryption mechanism. This is
          useful in limited cases with very large datasets, or for data archival. See the{" "}
          <a href="https://docs.tre.arc.ucl.ac.uk/">documentation</a> for more information.
        </HelperText>
      </div>
    </>
  );
}
