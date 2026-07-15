import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import InfoTooltip from "../../ui/InfoTooltip";
import { HelperText, Alert, AlertMessage, Label } from "../../shared/uikitExports";
import { ProjectFormData } from "@/types/projects";
import { ProjectTreRoleName } from "@/openapi";
import styles from "./ProjectFormTRE.module.css";
import RadioOptions from "@/components/ui/form/RadioOptions";
import { Role, roles } from "./roles";
import UserLookup from "@/components/shared/UserLookup";
import Button from "@/components/ui/Button";
import { desktopInstances } from "./desktops";

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

  const {
    fields: whitelistFields,
    append: appendWhitelist,
    remove: removeWhitelist,
  } = useFieldArray({
    control,
    name: "tre.airlockWhitelist",
  });

  const { append: appendUserConfig, update: updateUserConfig } = useFieldArray({
    control,
    name: "tre.userConfig",
  });

  const rolesMap = Object.entries(roles) as [ProjectTreRoleName, Role][];

  const numRequiredEgressApprovals = watch("tre.numRequiredEgressApprovals");
  const members = watch("members");
  const numEgressCheckers = members.filter((member) => member.roles.includes("egress_checker")).length;
  const airlockExternalDataEnabled = watch("tre.airlockExternalDataEnabled");
  const userConfig = watch("tre.userConfig");
  const desktopUsers = members.filter((member) => member.roles.includes("desktop_user"));
  const requiresHPCDesktops = watch("tre.requiresHPCDesktops") === "true";

  const isDesktopUser = (username: string): boolean => {
    console.log(username);
    return members.some((member) => member.username == username && member.roles.includes("desktop_user"));
  };

  return (
    <>
      <div className="field">
        <Label htmlFor="members">Project users (optional):*</Label>
        <fieldset className="linkage-fieldset">
          <UserLookup
            filterByApprovedResearchers={true}
            usernames={Array.from(members, (member) => member.username)}
            appendUsername={(value: string) => {
              appendResearcher({ username: value, roles: [] });
              if (!userConfig?.some((u) => u.username === value)) {
                appendUserConfig({ username: value, hpcInstance: undefined });
              }
            }}
            removeUsername={(username: string) => {
              const index = researcherFields.findIndex((field) => field.username === username);
              if (index !== -1) removeResearcher(index);
            }}
            roleControl={(user) => {
              const memberIndex = members.findIndex((member) => member.username === user.username);
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
                      hasDesktopIfNeeded: (value) => {
                        const isEgressChecker = value.includes("egress_checker");
                        const isEgressRequester = value.includes("egress_requester");
                        const hasDesktop = value.includes("desktop_user");
                        if ((isEgressChecker || isEgressRequester) && !hasDesktop) {
                          return "Egress requesters and checkers must have the Desktop User role";
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
                          data-cy="tre-member-role-dropdown"
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

      {desktopUsers.length > 0 && (
        <>
          <RadioOptions
            name="tre.requiresHPCDesktops"
            label="Will any desktop users run compute intenstive workloads? *"
            options={[
              { name: "Yes", value: "true" },
              { name: "No", value: "false" },
            ]}
            register={register}
            error={errors.tre?.requiresHPCDesktops}
          />
          <HelperText>
            Compute intensive workloads require more than a standard 2 core, 4 GB RAM desktop. If you require a GPU for
            then please select yes. See the <a href="https://docs.tre.arc.ucl.ac.uk/pricing/">documentation</a> for
            pricing information.
          </HelperText>
          {requiresHPCDesktops && userConfig && (
            <div className="field">
              <Label htmlFor="hpcInstances">HPC Desktops:</Label>
              <fieldset className="linkage-fieldset">
                {userConfig.map(
                  (field, index) =>
                    isDesktopUser(field.username) && (
                      <div key={field.username} className="item-wrapper">
                        {field.username}
                        <select
                          id="hpcInstances"
                          name="hpcInstances"
                          className={styles["userconfig-dropdown"]}
                          onChange={(e) => {
                            if (e.target.value === "") {
                              updateUserConfig(index, { username: field.username, hpcInstance: "" });
                            } else if (e.target.value) {
                              updateUserConfig(index, { username: field.username, hpcInstance: e.target.value });
                            }
                          }}
                          value={field.hpcInstance}
                          disabled={fieldsDisabled}
                        >
                          <option value="">None</option>
                          {desktopInstances.map((instance, index) => (
                            <option key={index} value={instance.aws_value}>
                              {instance.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )
                )}
              </fieldset>
            </div>
          )}
        </>
      )}

      <div>
        <RadioOptions
          name="tre.numRequiredEgressApprovals"
          label="Number of required approvals to egress files *"
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
        {numRequiredEgressApprovals === "1" && members.length > 1 && (
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
