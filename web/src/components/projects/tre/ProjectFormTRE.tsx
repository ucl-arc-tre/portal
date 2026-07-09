import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import InfoTooltip from "../../ui/InfoTooltip";
import { HelperText, Alert, AlertMessage, Label } from "../../shared/uikitExports";
import { ProjectFormData } from "@/types/projects";
import Button from "@/components/ui/Button";
import { ProjectTre, ProjectTreRoleName } from "@/openapi";
import styles from "./ProjectFormTRE.module.css";
import RadioOptions from "@/components/ui/form/RadioOptions";
import { Role, roles } from "./roles";

// this should match the domain that is used for the entra ID users in the portal
const domainName = process.env.NEXT_PUBLIC_DOMAIN_NAME || "@ucl.ac.uk";

// Mirrors backend validation in internal/validation/ip.go (IsIPv4OrFQDN).
const ipv4Regex =
  /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$/;
const fqdnRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

function isIPv4OrFQDN(value: string): boolean {
  if (ipv4Regex.test(value)) {
    return true;
  }
  return value.length <= 253 && fqdnRegex.test(value);
}

type Props = {
  fieldsDisabled: boolean;
  editingProject: ProjectTre | null | undefined;
};

export default function ProjectFormTREStep(props: Props) {
  const { fieldsDisabled, editingProject } = props;
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

  const {
    fields: whitelistFields,
    append: appendWhitelist,
    remove: removeWhitelist,
  } = useFieldArray({
    control,
    name: "tre.airlockWhitelist",
  });

  const rolesMap = Object.entries(roles) as [ProjectTreRoleName, Role][];

  const numRequiredEgressApprovals = watch("tre.numRequiredEgressApprovals");
  const members = watch("members");
  const numEgressCheckers = members.filter((member) => member.roles.includes("egress_checker")).length;
  const airlockExternalDataEnabled = watch("tre.airlockExternalDataEnabled");

  return (
    <>
      <div className="field">
        <Label htmlFor="members">Project users (optional):*</Label>
        <fieldset className="linkage-fieldset">
          {researcherFields.map((field, index) => {
            const researcher = members[index];
            const availableRolesToAdd = rolesMap.filter(([roleName]) => !researcher?.roles?.includes(roleName));

            return (
              <div key={field.id} className="item-wrapper">
                <div className={styles["researcher-content"]}>
                  <div>
                    <label htmlFor={`researcher-${index}`} className={styles["field-label"]}>
                      Username:
                    </label>
                    <Controller
                      name={`members.${index}.username` as const}
                      control={control}
                      rules={{
                        required: "Username is required",
                        validate: {
                          isNotEmpty: (value) => {
                            if (!value || value.trim() === "") {
                              return "Username is required";
                            }
                            return true;
                          },
                          notEmailPart: (value) => {
                            if (value.includes("@")) {
                              return `Enter only the username part (without ${domainName})`;
                            }
                            return true;
                          },
                          isUnique: (value) => {
                            const allUsernames = members.map((user) => user.username);
                            const duplicateCount = allUsernames.filter((username) => username === value).length;
                            return duplicateCount <= 1 || "Username has already been entered";
                          },
                        },
                      }}
                      render={({ field: usernameField, fieldState }) => (
                        <div className={styles["username-input-wrapper"]}>
                          <div>
                            <input
                              {...usernameField}
                              id={`researcher-${index}`}
                              type="text"
                              placeholder="ccaxyz"
                              disabled={
                                fieldsDisabled ||
                                editingProject?.members.some((member) => {
                                  return member.username === getValues("members")[index].username + domainName;
                                })
                              }
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
                  </div>

                  <div>
                    <label>Roles:</label>
                    <Controller
                      name={`members.${index}.roles` as const}
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
                        <div>
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
                                      const currentRoles = getValues(`members.${index}.roles`);
                                      setValue(
                                        `members.${index}.roles`,
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
                              className={`${styles["role-dropdown"]}`}
                              value=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  const currentRoles = getValues(`members.${index}.roles`) || [];
                                  setValue(
                                    `members.${index}.roles`,
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
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeResearcher(index)}
                  className="remove-button"
                  aria-label={`Remove researcher ${index + 1}`}
                >
                  ×
                </button>
              </div>
            );
          })}

          <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={() => appendResearcher({ username: "", roles: [] })}
          >
            Add Researcher
          </Button>
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
          label="Will data need to be stored outside of the TRE? *"
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

      <div>
        <RadioOptions
          name="tre.airlockExternalDataEnabled"
          label="Does your project need to download or retrieve data from an external website or API? *"
          options={[
            { name: "Yes", value: "true" },
            { name: "No", value: "false" },
          ]}
          register={register}
          error={errors.tre?.airlockExternalDataEnabled}
        />
        <HelperText>
          Data can be pulled into the TRE from an external source by logging into the airlock and running an appropriate
          download command (e.g. `curl`). This requires whitelisting the external source for outbound network access.
          See the <a href="https://docs.tre.arc.ucl.ac.uk/">documentation</a> for more information.
        </HelperText>
      </div>

      {airlockExternalDataEnabled === "true" && (
        <div className="field">
          <Label>Airlock whitelist (optional):</Label>
          <fieldset className="linkage-fieldset">
            {whitelistFields.map((field, index) => (
              <div key={field.id} className="item-wrapper">
                <Controller
                  name={`tre.airlockWhitelist.${index}.value` as const}
                  control={control}
                  rules={{
                    validate: {
                      isNotEmpty: (value) => {
                        if (!value || value.trim() === "") {
                          return "An IP or domain is required";
                        }
                        return true;
                      },
                      isIPv4OrFQDN: (value) => {
                        if (value && !isIPv4OrFQDN(value.trim())) {
                          return "Must be a valid IPv4 address or domain";
                        }
                        return true;
                      },
                    },
                  }}
                  render={({ field: whitelistField, fieldState }) => (
                    <div>
                      <input
                        {...whitelistField}
                        id={`airlock-whitelist-${index}`}
                        type="text"
                        placeholder="192.168.0.1 or example.ucl.ac.uk"
                        disabled={fieldsDisabled}
                      />
                      {fieldState.error && (
                        <Alert type="error">
                          <AlertMessage>{fieldState.error.message}</AlertMessage>
                        </Alert>
                      )}
                    </div>
                  )}
                />

                <button
                  type="button"
                  onClick={() => removeWhitelist(index)}
                  className="remove-button"
                  aria-label={`Remove whitelist entry ${index + 1}`}
                >
                  ×
                </button>
              </div>
            ))}

            <Button type="button" variant="secondary" size="small" onClick={() => appendWhitelist({ value: "" })}>
              Add IP / Domain
            </Button>
          </fieldset>
          <HelperText>
            Optionally add IPs or domains (e.g. 127.0.0.1 or example.ucl.ac.uk) to whitelist in the TRE airlock for this
            project.
          </HelperText>
        </div>
      )}
    </>
  );
}
